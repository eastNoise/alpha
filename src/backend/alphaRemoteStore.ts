import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY, STATE_SCHEMA_VERSION } from '../data';
import { AppState } from '../types';
import { supabase } from './supabaseClient';
import { Json } from './supabaseTypes';

const SYNC_META_KEY = `${STORAGE_KEY}:sync-meta`;

interface SyncMeta {
  userId: string;
  localUpdatedAt: string;
  remoteUpdatedAt?: string;
}

export interface RemoteSnapshot {
  state: AppState;
  updatedAt: string;
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AppState>;
  return (
    candidate.schemaVersion === STATE_SCHEMA_VERSION &&
    typeof candidate.hasOnboarded === 'boolean' &&
    Boolean(candidate.currentCourse) &&
    Boolean(candidate.today) &&
    Array.isArray(candidate.records)
  );
}

async function readSyncMeta(): Promise<SyncMeta | null> {
  const raw = await AsyncStorage.getItem(SYNC_META_KEY);
  return raw ? (JSON.parse(raw) as SyncMeta) : null;
}

async function writeSyncMeta(meta: SyncMeta) {
  await AsyncStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

export async function markLocalStateUpdated(userId?: string | null) {
  if (!userId) return;
  const previous = await readSyncMeta();
  await writeSyncMeta({
    userId,
    localUpdatedAt: new Date().toISOString(),
    remoteUpdatedAt: previous?.userId === userId ? previous.remoteUpdatedAt : undefined,
  });
}

export async function getRemoteSnapshot(userId: string): Promise<RemoteSnapshot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('alpha_state_snapshots')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data || !isAppState(data.state)) return null;

  return {
    state: data.state,
    updatedAt: data.updated_at,
  };
}

export async function chooseStateForUser(userId: string, localState: AppState) {
  const [meta, remote] = await Promise.all([readSyncMeta(), getRemoteSnapshot(userId)]);
  if (!remote) return { state: localState, shouldPushLocal: true, remoteUpdatedAt: undefined };

  const localKnownForUser = meta?.userId === userId;
  const localUpdatedAt = localKnownForUser ? meta.localUpdatedAt : undefined;
  const shouldUseRemote = !localUpdatedAt || remote.updatedAt > localUpdatedAt;

  if (shouldUseRemote) {
    await writeSyncMeta({
      userId,
      localUpdatedAt: remote.updatedAt,
      remoteUpdatedAt: remote.updatedAt,
    });
    return { state: remote.state, shouldPushLocal: false, remoteUpdatedAt: remote.updatedAt };
  }

  return { state: localState, shouldPushLocal: true, remoteUpdatedAt: remote.updatedAt };
}

export async function pushRemoteState(userId: string, state: AppState) {
  if (!supabase) return null;
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from('alpha_state_snapshots').upsert(
    {
      user_id: userId,
      schema_version: state.schemaVersion,
      state: state as unknown as Json,
      updated_at: updatedAt,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;

  await writeSyncMeta({
    userId,
    localUpdatedAt: updatedAt,
    remoteUpdatedAt: updatedAt,
  });

  return updatedAt;
}
