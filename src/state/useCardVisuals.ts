import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { useEffect, useState } from 'react';

export type CardVisualTarget = 'today' | 'records' | 'course';
export type CardVisualUris = Partial<Record<CardVisualTarget, string>>;
export type CardVisualAsset = {
  fileName?: string | null;
  mimeType?: string;
  uri: string;
};

const CARD_VISUAL_STORAGE_KEY = 'alpha:v19:card-visuals';
const cardVisualDirectory = new Directory(Paths.document, 'card-visuals');

function fileExtension(asset: CardVisualAsset) {
  const namedExtension = asset.fileName?.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  if (namedExtension && /^[a-z0-9]{2,5}$/.test(namedExtension)) return namedExtension;

  switch (asset.mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
    case 'image/heif':
      return 'heic';
    default:
      return 'jpg';
  }
}

function existingVisualUris(value: unknown): CardVisualUris {
  if (!value || typeof value !== 'object') return {};

  return (['today', 'records', 'course'] as CardVisualTarget[]).reduce<CardVisualUris>((result, target) => {
    const uri = (value as Record<string, unknown>)[target];
    if (typeof uri !== 'string') return result;

    try {
      if (new File(uri).exists) result[target] = uri;
    } catch {
      // Ignore stale or malformed paths left by a previous installation.
    }
    return result;
  }, {});
}

async function persistVisualUris(uris: CardVisualUris) {
  await AsyncStorage.setItem(CARD_VISUAL_STORAGE_KEY, JSON.stringify(uris));
}

export function useCardVisuals() {
  const [uris, setUris] = useState<CardVisualUris>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(CARD_VISUAL_STORAGE_KEY)
      .then(async (raw) => {
        if (!mounted || !raw) return;
        const stored = JSON.parse(raw) as unknown;
        const validUris = existingVisualUris(stored);
        setUris(validUris);
        if (JSON.stringify(stored) !== JSON.stringify(validUris)) {
          await persistVisualUris(validUris);
        }
      })
      .catch(() => AsyncStorage.removeItem(CARD_VISUAL_STORAGE_KEY).catch(() => undefined))
      .finally(() => {
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function save(target: CardVisualTarget, asset: CardVisualAsset) {
    cardVisualDirectory.create({ idempotent: true, intermediates: true });

    const source = new File(asset.uri);
    const destination = new File(
      cardVisualDirectory,
      `${target}-${Date.now()}.${fileExtension(asset)}`,
    );
    source.copy(destination);

    if (!destination.exists) throw new Error('Card image copy failed.');

    const previousUri = uris[target];
    const nextUris = { ...uris, [target]: destination.uri };
    try {
      await persistVisualUris(nextUris);
      setUris(nextUris);
    } catch (error) {
      if (destination.exists) destination.delete();
      throw error;
    }

    if (previousUri && previousUri !== destination.uri) {
      try {
        const previousFile = new File(previousUri);
        if (previousFile.exists) previousFile.delete();
      } catch {
        // The new selection is already durable even if stale-file cleanup fails.
      }
    }
  }

  async function restoreDefault(target: CardVisualTarget) {
    const previousUri = uris[target];
    if (!previousUri) return;

    const nextUris = { ...uris };
    delete nextUris[target];
    await persistVisualUris(nextUris);
    setUris(nextUris);

    try {
      const previousFile = new File(previousUri);
      if (previousFile.exists) previousFile.delete();
    } catch {
      // Removing the preference is enough to restore the bundled image.
    }
  }

  return {
    ready,
    restoreDefault,
    save,
    uris,
  };
}
