#!/usr/bin/env python3
import argparse
import json
import os
import time
from pathlib import Path

import jwt
import requests

BASE_URL = "https://api.appstoreconnect.apple.com/v1"


def auth_headers():
    key_id = os.environ["ASC_KEY_ID"]
    issuer_id = os.environ["ASC_ISSUER_ID"]
    key_path = Path(os.environ["ASC_KEY_PATH"])
    now = int(time.time())
    token = jwt.encode(
        {"iss": issuer_id, "iat": now, "exp": now + 1200, "aud": "appstoreconnect-v1"},
        key_path.read_text(),
        algorithm="ES256",
        headers={"kid": key_id},
    )
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def request(method, path, headers, *, params=None, payload=None):
    response = requests.request(
        method,
        f"{BASE_URL}{path}",
        headers=headers,
        params=params,
        json=payload,
        timeout=45,
    )
    if not response.ok:
        raise RuntimeError(f"{method} {path} failed ({response.status_code}): {response.text}")
    return response.json() if response.content else None


def one(items, label):
    if len(items) != 1:
        raise RuntimeError(f"Expected one {label}, found {len(items)}")
    return items[0]


def discover(headers, bundle_id, version_string):
    app = one(request("GET", "/apps", headers, params={"filter[bundleId]": bundle_id})["data"], "app")
    app_id = app["id"]
    versions = request(
        "GET",
        f"/apps/{app_id}/appStoreVersions",
        headers,
        params={"filter[platform]": "IOS", "filter[versionString]": version_string},
    )["data"]
    version = one(versions, "editable iOS version")
    app_infos = request("GET", f"/apps/{app_id}/appInfos", headers)["data"]
    version_state = version["attributes"].get("appStoreState")
    matching_infos = [
        item
        for item in app_infos
        if item["attributes"].get("appStoreState") == version_state
    ]
    if len(matching_infos) == 1:
        app_info = matching_infos[0]
    elif len(app_infos) == 1:
        app_info = app_infos[0]
    else:
        app_info = one(matching_infos, f"app info in {version_state} state")
    return app, app_info, version


def discover_app(headers, bundle_id):
    return one(
        request("GET", "/apps", headers, params={"filter[bundleId]": bundle_id})[
            "data"
        ],
        "app",
    )


def create_version(headers, app, version_string):
    existing = request(
        "GET",
        f"/apps/{app['id']}/appStoreVersions",
        headers,
        params={
            "filter[platform]": "IOS",
            "filter[versionString]": version_string,
        },
    )["data"]
    if existing:
        version = one(existing, f"iOS version {version_string}")
        print(f"iOS version {version_string} already exists")
        return version

    payload = {
        "data": {
            "type": "appStoreVersions",
            "attributes": {
                "platform": "IOS",
                "versionString": version_string,
                "releaseType": "MANUAL",
            },
            "relationships": {
                "app": {"data": {"type": "apps", "id": app["id"]}}
            },
        }
    }
    version = request("POST", "/appStoreVersions", headers, payload=payload)["data"]
    print(f"Created iOS version {version_string}")
    return version


def attach_build(headers, app_id, version, build_number):
    builds = request(
        "GET",
        "/builds",
        headers,
        params={
            "filter[app]": app_id,
            "filter[version]": build_number,
            "sort": "-uploadedDate",
            "limit": 10,
        },
    )["data"]
    processed = [
        build
        for build in builds
        if build["attributes"].get("processingState") == "VALID"
        and not build["attributes"].get("expired")
    ]
    build = one(processed, f"valid build {build_number}")
    request(
        "PATCH",
        f"/appStoreVersions/{version['id']}/relationships/build",
        headers,
        payload={"data": {"type": "builds", "id": build["id"]}},
    )
    print(f"Attached build {build_number} to version {version['attributes']['versionString']}")


def review_submission_items(headers, submission_id):
    return request(
        "GET",
        f"/reviewSubmissions/{submission_id}/items",
        headers,
        params={"limit": 50},
    )["data"]


def submit_version(headers, app, version):
    submissions = request(
        "GET",
        f"/apps/{app['id']}/reviewSubmissions",
        headers,
        params={"limit": 200},
    )["data"]

    for submission in submissions:
        if submission["attributes"].get("state") not in {
            "READY_FOR_REVIEW",
            "WAITING_FOR_REVIEW",
            "IN_REVIEW",
        }:
            continue
        for item in review_submission_items(headers, submission["id"]):
            relationship = item.get("relationships", {}).get("appStoreVersion", {})
            if relationship.get("data", {}).get("id") != version["id"]:
                continue
            state = submission["attributes"].get("state")
            if state != "READY_FOR_REVIEW":
                print(f"Version is already in review submission state {state}")
                return submission
            request(
                "PATCH",
                f"/reviewSubmissions/{submission['id']}",
                headers,
                payload={
                    "data": {
                        "type": "reviewSubmissions",
                        "id": submission["id"],
                        "attributes": {"submitted": True},
                    }
                },
            )
            print("Submitted existing review submission")
            return request(
                "GET", f"/reviewSubmissions/{submission['id']}", headers
            )["data"]

    submission = request(
        "POST",
        "/reviewSubmissions",
        headers,
        payload={
            "data": {
                "type": "reviewSubmissions",
                "relationships": {
                    "app": {"data": {"type": "apps", "id": app["id"]}}
                },
            }
        },
    )["data"]

    request(
        "POST",
        "/reviewSubmissionItems",
        headers,
        payload={
            "data": {
                "type": "reviewSubmissionItems",
                "relationships": {
                    "reviewSubmission": {
                        "data": {
                            "type": "reviewSubmissions",
                            "id": submission["id"],
                        }
                    },
                    "appStoreVersion": {
                        "data": {
                            "type": "appStoreVersions",
                            "id": version["id"],
                        }
                    },
                },
            }
        },
    )

    submitted = request(
        "PATCH",
        f"/reviewSubmissions/{submission['id']}",
        headers,
        payload={
            "data": {
                "type": "reviewSubmissions",
                "id": submission["id"],
                "attributes": {"submitted": True},
            }
        },
    )["data"]
    print("Created and submitted review submission")
    return submitted


def upsert_localization(headers, collection, parent_type, parent_id, locale, attributes):
    existing = request("GET", f"/{parent_type}/{parent_id}/{collection}", headers)["data"]
    match = next((item for item in existing if item["attributes"]["locale"] == locale), None)
    resource_type = collection
    if match:
        payload = {"data": {"type": resource_type, "id": match["id"], "attributes": attributes}}
        request("PATCH", f"/{collection}/{match['id']}", headers, payload=payload)
        return "updated"
    payload = {
        "data": {
            "type": resource_type,
            "attributes": {"locale": locale, **attributes},
            "relationships": {parent_type[:-1]: {"data": {"type": parent_type, "id": parent_id}}},
        }
    }
    request("POST", f"/{collection}", headers, payload=payload)
    return "created"


def validate_metadata(metadata):
    for locale, item in metadata["localizations"].items():
        checks = {
            "name": (item.get("name", metadata["appName"]), 30),
            "subtitle": (item["subtitle"], 30),
            "promotionalText": (item["promotionalText"], 170),
            "keywords": (item["keywords"], 100),
            "description": (item["description"], 4000),
            "whatsNew": (item["whatsNew"], 4000),
        }
        for field, (value, limit) in checks.items():
            used = len(value.encode("utf-8")) if field == "keywords" else len(value)
            unit = "UTF-8 bytes" if field == "keywords" else "characters"
            if used > limit:
                raise RuntimeError(f"{locale} {field} is {used} {unit}; limit is {limit}")


def apply_metadata(headers, app_info, version, metadata, only_locale=None):
    validate_metadata(metadata)
    for locale, item in metadata["localizations"].items():
        if only_locale and locale != only_locale:
            continue
        info_action = upsert_localization(
            headers,
            "appInfoLocalizations",
            "appInfos",
            app_info["id"],
            locale,
            {
                "name": item.get("name", metadata["appName"]),
                "subtitle": item["subtitle"],
                "privacyPolicyUrl": metadata["privacyPolicyUrl"],
            },
        )
        version_action = upsert_localization(
            headers,
            "appStoreVersionLocalizations",
            "appStoreVersions",
            version["id"],
            locale,
            {
                "description": item["description"],
                "keywords": item["keywords"],
                "marketingUrl": metadata["marketingUrl"],
                "promotionalText": item["promotionalText"],
                "supportUrl": metadata["supportUrl"],
                "whatsNew": item["whatsNew"],
            },
        )
        print(f"{locale}: app info {info_action}, version metadata {version_action}")

    request(
        "PATCH",
        f"/appStoreVersions/{version['id']}",
        headers,
        payload={
            "data": {
                "type": "appStoreVersions",
                "id": version["id"],
                "attributes": {"copyright": metadata["copyright"], "releaseType": "MANUAL"},
            }
        },
    )


def apply_compliance(headers, app, app_info, compliance):
    request(
        "PATCH",
        f"/apps/{app['id']}",
        headers,
        payload={
            "data": {
                "type": "apps",
                "id": app["id"],
                "attributes": {
                    "contentRightsDeclaration": compliance["contentRightsDeclaration"]
                },
            }
        },
    )
    request(
        "PATCH",
        f"/appInfos/{app_info['id']}",
        headers,
        payload={
            "data": {
                "type": "appInfos",
                "id": app_info["id"],
                "relationships": {
                    "primaryCategory": {
                        "data": {
                            "type": "appCategories",
                            "id": compliance["primaryCategory"],
                        }
                    },
                    "secondaryCategory": {
                        "data": {
                            "type": "appCategories",
                            "id": compliance["secondaryCategory"],
                        }
                    },
                },
            }
        },
    )
    age_declaration = request(
        "GET", f"/appInfos/{app_info['id']}/ageRatingDeclaration", headers
    )["data"]
    request(
        "PATCH",
        f"/ageRatingDeclarations/{age_declaration['id']}",
        headers,
        payload={
            "data": {
                "type": "ageRatingDeclarations",
                "id": age_declaration["id"],
                "attributes": compliance["ageRating"],
            }
        },
    )
    print("Content rights, categories, and age rating updated")


def version_localizations(headers, version_id):
    items = request(
        "GET",
        f"/appStoreVersions/{version_id}/appStoreVersionLocalizations",
        headers,
        params={"limit": 200},
    )["data"]
    return {item["attributes"]["locale"]: item for item in items}


def screenshot_sets(headers, localization_id):
    return request(
        "GET",
        f"/appStoreVersionLocalizations/{localization_id}/appScreenshotSets",
        headers,
        params={"limit": 200},
    )["data"]


def create_screenshot_set(headers, localization_id, display_type):
    payload = {
        "data": {
            "type": "appScreenshotSets",
            "attributes": {"screenshotDisplayType": display_type},
            "relationships": {
                "appStoreVersionLocalization": {
                    "data": {
                        "type": "appStoreVersionLocalizations",
                        "id": localization_id,
                    }
                }
            },
        }
    }
    return request("POST", "/appScreenshotSets", headers, payload=payload)["data"]


def reserve_screenshot(headers, screenshot_set_id, path):
    payload = {
        "data": {
            "type": "appScreenshots",
            "attributes": {"fileName": path.name, "fileSize": path.stat().st_size},
            "relationships": {
                "appScreenshotSet": {
                    "data": {
                        "type": "appScreenshotSets",
                        "id": screenshot_set_id,
                    }
                }
            },
        }
    }
    return request("POST", "/appScreenshots", headers, payload=payload)["data"]


def upload_reserved_asset(asset, path):
    contents = path.read_bytes()
    for operation in asset["attributes"]["uploadOperations"]:
        offset = operation["offset"]
        length = operation["length"]
        upload_headers = {
            item["name"]: item["value"]
            for item in operation.get("requestHeaders", [])
        }
        response = requests.request(
            operation["method"],
            operation["url"],
            headers=upload_headers,
            data=contents[offset : offset + length],
            timeout=120,
        )
        if not response.ok:
            raise RuntimeError(
                f"Asset upload failed ({response.status_code}): {response.text}"
            )


def wait_for_screenshot(headers, screenshot_id, timeout=180):
    deadline = time.time() + timeout
    while time.time() < deadline:
        screenshot = request(
            "GET", f"/appScreenshots/{screenshot_id}", headers
        )["data"]
        delivery = screenshot["attributes"].get("assetDeliveryState") or {}
        state = delivery.get("state")
        if state == "COMPLETE":
            return screenshot
        if state == "FAILED":
            errors = delivery.get("errors", [])
            raise RuntimeError(f"Screenshot processing failed: {errors}")
        time.sleep(3)
    raise RuntimeError(f"Screenshot {screenshot_id} did not finish processing")


def upload_screenshots(
    headers, version, metadata, screenshots_root, display_type, only_locale=None
):
    localizations = version_localizations(headers, version["id"])
    root = Path(screenshots_root)
    for locale in metadata["localizations"]:
        if only_locale and locale != only_locale:
            continue
        if locale not in localizations:
            raise RuntimeError(f"Missing App Store localization for {locale}")
        paths = sorted((root / locale).glob("*.jpg"))
        if not paths:
            raise RuntimeError(f"No JPG screenshots found for {locale} in {root / locale}")
        if len(paths) > 10:
            raise RuntimeError(f"{locale} has {len(paths)} screenshots; maximum is 10")

        localization_id = localizations[locale]["id"]
        existing = next(
            (
                item
                for item in screenshot_sets(headers, localization_id)
                if item["attributes"]["screenshotDisplayType"] == display_type
            ),
            None,
        )
        if existing:
            request("DELETE", f"/appScreenshotSets/{existing['id']}", headers)

        screenshot_set = create_screenshot_set(
            headers, localization_id, display_type
        )
        uploaded_ids = []
        for path in paths:
            asset = reserve_screenshot(headers, screenshot_set["id"], path)
            upload_reserved_asset(asset, path)
            screenshot_id = asset["id"]
            request(
                "PATCH",
                f"/appScreenshots/{screenshot_id}",
                headers,
                payload={
                    "data": {
                        "type": "appScreenshots",
                        "id": screenshot_id,
                        "attributes": {"uploaded": True},
                    }
                },
            )
            wait_for_screenshot(headers, screenshot_id)
            uploaded_ids.append(screenshot_id)
            print(f"{locale}: uploaded {path.name}")

        request(
            "PATCH",
            f"/appScreenshotSets/{screenshot_set['id']}/relationships/appScreenshots",
            headers,
            payload={
                "data": [
                    {"type": "appScreenshots", "id": screenshot_id}
                    for screenshot_id in uploaded_ids
                ]
            },
        )
        print(f"{locale}: {len(uploaded_ids)} screenshots ready")


def inspect_screenshots(headers, version):
    result = {}
    for locale, localization in version_localizations(headers, version["id"]).items():
        result[locale] = []
        for item in screenshot_sets(headers, localization["id"]):
            screenshots = request(
                "GET",
                f"/appScreenshotSets/{item['id']}/appScreenshots",
                headers,
                params={"limit": 200},
            )["data"]
            result[locale].append(
                {
                    "id": item["id"],
                    "displayType": item["attributes"]["screenshotDisplayType"],
                    "screenshots": [
                        {
                            "fileName": screenshot["attributes"].get("fileName"),
                            "state": (
                                screenshot["attributes"].get("assetDeliveryState")
                                or {}
                            ).get("state"),
                        }
                        for screenshot in screenshots
                    ],
                }
            )
    print(json.dumps(result, ensure_ascii=False, indent=2))


def inspect_builds(headers, app_id):
    builds = request(
        "GET",
        "/builds",
        headers,
        params={"filter[app]": app_id, "sort": "-uploadedDate", "limit": 10},
    )["data"]
    print(
        json.dumps(
            [
                {
                    "id": build["id"],
                    "version": build["attributes"].get("version"),
                    "processingState": build["attributes"].get("processingState"),
                    "uploadedDate": build["attributes"].get("uploadedDate"),
                    "expired": build["attributes"].get("expired"),
                }
                for build in builds
            ],
            ensure_ascii=False,
            indent=2,
        )
    )


def inspect_beta_groups(headers, app_id):
    groups = request(
        "GET",
        f"/apps/{app_id}/betaGroups",
        headers,
        params={"limit": 200},
    )["data"]
    print(
        json.dumps(
            [
                {
                    "id": group["id"],
                    "name": group["attributes"].get("name"),
                    "isInternalGroup": group["attributes"].get("isInternalGroup"),
                    "hasAccessToAllBuilds": group["attributes"].get(
                        "hasAccessToAllBuilds"
                    ),
                }
                for group in groups
            ],
            ensure_ascii=False,
            indent=2,
        )
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command",
        choices=(
            "inspect",
            "create-version",
            "apply-metadata",
            "apply-compliance",
            "inspect-screenshots",
            "upload-screenshots",
            "inspect-builds",
            "inspect-beta-groups",
            "attach-build",
            "submit-version",
        ),
    )
    parser.add_argument("--bundle-id", default="com.eastnoise.alpha")
    parser.add_argument("--version", default="1.0")
    parser.add_argument("--metadata", default="release/app-store-metadata.json")
    parser.add_argument("--compliance", default="release/app-store-compliance.json")
    parser.add_argument("--screenshots", default="release/screenshots/upload")
    # App Store Connect still names the 6.9-inch iPhone target APP_IPHONE_67.
    parser.add_argument("--display-type", default="APP_IPHONE_67")
    parser.add_argument("--locale")
    parser.add_argument("--build-number")
    args = parser.parse_args()

    headers = auth_headers()
    if args.command == "create-version":
        app = discover_app(headers, args.bundle_id)
        version = create_version(headers, app, args.version)
        print(json.dumps({"version": {"id": version["id"], **version["attributes"]}}, ensure_ascii=False, indent=2))
        return

    app, app_info, version = discover(headers, args.bundle_id, args.version)
    print(json.dumps({
        "app": {"id": app["id"], **app["attributes"]},
        "appInfo": {"id": app_info["id"], **app_info["attributes"]},
        "version": {"id": version["id"], **version["attributes"]},
    }, ensure_ascii=False, indent=2))
    if args.command == "apply-metadata":
        metadata = json.loads(Path(args.metadata).read_text())
        apply_metadata(headers, app_info, version, metadata, args.locale)
    elif args.command == "apply-compliance":
        compliance = json.loads(Path(args.compliance).read_text())
        apply_compliance(headers, app, app_info, compliance)
    elif args.command == "inspect-screenshots":
        inspect_screenshots(headers, version)
    elif args.command == "upload-screenshots":
        metadata = json.loads(Path(args.metadata).read_text())
        upload_screenshots(
            headers,
            version,
            metadata,
            args.screenshots,
            args.display_type,
            args.locale,
        )
    elif args.command == "inspect-builds":
        inspect_builds(headers, app["id"])
    elif args.command == "inspect-beta-groups":
        inspect_beta_groups(headers, app["id"])
    elif args.command == "attach-build":
        if not args.build_number:
            parser.error("--build-number is required for attach-build")
        attach_build(headers, app["id"], version, args.build_number)
    elif args.command == "submit-version":
        submission = submit_version(headers, app, version)
        print(
            json.dumps(
                {"reviewSubmission": {"id": submission["id"], **submission["attributes"]}},
                ensure_ascii=False,
                indent=2,
            )
        )


if __name__ == "__main__":
    main()
