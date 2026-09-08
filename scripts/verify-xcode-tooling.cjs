// Guard the xcode -> uuid security override against CJS and project-format regressions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const xcode = require('xcode');
const root = path.resolve(__dirname, '..');
const project = xcode.project(path.join(root, 'ios/ALPHA.xcodeproj/project.pbxproj'));
project.parseSync();
const ids = new Set();
for (let i = 0; i < 1000; i++) {
  const id = project.generateUuid();
  assert.match(id, /^[A-F0-9]{24}$/);
  assert.ok(!ids.has(id));
  assert.ok(!project.allUuids().includes(id));
  ids.add(id);
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'alpha-xcode-verify-'));
const output = path.join(temp, 'project.pbxproj');
try {
  fs.writeFileSync(output, project.writeSync());
  const roundtrip = xcode.project(output);
  roundtrip.parseSync();
  assert.deepEqual(roundtrip.hash, project.hash);
  console.log('Xcode tooling verified: CJS, 1000 IDs, project parse/write roundtrip.');
} finally {
  fs.unlinkSync(output);
  fs.rmdirSync(temp);
}
