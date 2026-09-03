import { manipulateAsync, SaveFormat, type Action, type ImageResult } from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { CropZoom, type CropZoomRefType } from 'react-native-zoom-toolkit';

import { colors, radius, spacing } from '../theme';

const OUTPUT_WIDTH = 1440;

type CropEditorLabels = {
  apply: string;
  cancel: string;
  instruction: string;
  title: string;
};

type CardImageCropEditorProps = {
  aspectRatio: number;
  asset: ImagePickerAsset;
  bottomInset: number;
  labels: CropEditorLabels;
  topInset: number;
  onApply: (image: ImageResult) => Promise<void>;
  onCancel: () => void;
  onError: () => void;
};

export function CardImageCropEditor({
  aspectRatio,
  asset,
  bottomInset,
  labels,
  topInset,
  onApply,
  onCancel,
  onError,
}: CardImageCropEditorProps) {
  const cropRef = useRef<CropZoomRefType>(null);
  const [saving, setSaving] = useState(false);
  const { width } = useWindowDimensions();
  const cropWidth = Math.max(1, width - spacing.screenX * 2);
  const safeAspectRatio = Number.isFinite(aspectRatio) && aspectRatio > 0
    ? aspectRatio
    : 16 / 9;
  const cropSize = {
    height: cropWidth / safeAspectRatio,
    width: cropWidth,
  };
  const resolution = {
    height: Math.max(1, asset.height),
    width: Math.max(1, asset.width),
  };

  async function applyCrop() {
    if (saving) return;
    const crop = cropRef.current?.crop(OUTPUT_WIDTH);
    if (!crop) return;

    setSaving(true);
    try {
      const actions: Action[] = [];
      if (crop.resize) actions.push({ resize: crop.resize });
      actions.push({ crop: crop.crop });
      const image = await manipulateAsync(asset.uri, actions, {
        compress: 0.9,
        format: SaveFormat.JPEG,
      });
      await onApply(image);
    } catch {
      onError();
      setSaving(false);
    }
  }

  function CropFrame() {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.cropShade} />
        <View style={[styles.cropRow, { height: cropSize.height }]}>
          <View style={styles.cropSideShade} />
          <View style={[styles.cropFrame, cropSize]}>
            <View style={[styles.gridVertical, { left: '33.333%' }]} />
            <View style={[styles.gridVertical, { right: '33.333%' }]} />
            <View style={[styles.gridHorizontal, { top: '33.333%' }]} />
            <View style={[styles.gridHorizontal, { bottom: '33.333%' }]} />
          </View>
          <View style={styles.cropSideShade} />
        </View>
        <View style={styles.cropShade} />
      </View>
    );
  }

  return (
    <View
      accessibilityViewIsModal
      style={styles.root}
    >
      <View style={[styles.header, { paddingTop: Math.max(topInset, 16) }]}>
        <TouchableOpacity
          accessibilityLabel={labels.cancel}
          accessibilityRole="button"
          activeOpacity={0.72}
          disabled={saving}
          style={styles.headerAction}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>{labels.cancel}</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.title}>{labels.title}</Text>
        <TouchableOpacity
          accessibilityLabel={labels.apply}
          accessibilityRole="button"
          activeOpacity={0.72}
          disabled={saving}
          style={styles.headerAction}
          onPress={() => void applyCrop()}
        >
          {saving ? (
            <ActivityIndicator color={colors.red} size="small" />
          ) : (
            <Text style={styles.applyText}>{labels.apply}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.editor}>
        <CropZoom
          ref={cropRef}
          cropSize={cropSize}
          resolution={resolution}
        >
          <Image resizeMethod="scale" source={{ uri: asset.uri }} style={styles.image} />
        </CropZoom>
        <CropFrame />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 20) }]}>
        <Text style={styles.instruction}>{labels.instruction}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    zIndex: 100,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#050505',
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 74,
    paddingBottom: 14,
    paddingHorizontal: spacing.screenX,
  },
  headerAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    width: 72,
  },
  title: {
    color: colors.white,
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  cancelText: {
    alignSelf: 'flex-start',
    color: '#d6d6d8',
    fontSize: 14,
    fontWeight: '800',
  },
  applyText: {
    alignSelf: 'flex-end',
    color: colors.red,
    fontSize: 14,
    fontWeight: '900',
  },
  editor: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  cropShade: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    flex: 1,
  },
  cropRow: {
    flexDirection: 'row',
  },
  cropSideShade: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    flex: 1,
  },
  cropFrame: {
    borderColor: 'rgba(241,25,25,0.88)',
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridVertical: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: StyleSheet.hairlineWidth,
  },
  gridHorizontal: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#050505',
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    minHeight: 82,
    paddingHorizontal: spacing.screenX,
    paddingTop: 18,
  },
  instruction: {
    color: '#a5a5aa',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
});
