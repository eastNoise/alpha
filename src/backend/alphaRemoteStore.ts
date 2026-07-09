import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY, STATE_SCHEMA_VERSION, createInitialState } from '../data';
import { AppState } from '../types';
import { supabase } from './supabaseClient';
import { Json } from './supabaseTypes';

const SYNC_META_KEY = `${STORAGE_KEY}:sync-meta`;
const USER_CACHE_PREFIX = `${STORAGE_KEY}:user-cache`;

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

function userCacheKey(userId: string) {
  return `${USER_CACHE_PREFIX}:${userId}`;
}

export async function readCachedStateForUser(userId: string): Promise<AppState | null> {
  const raw = await AsyncStorage.getItem(userCacheKey(userId));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as unknown;
  return isAppState(parsed) ? parsed : null;
}

export async function writeCachedStateForUser(userId: string, state: AppState, syncedAt?: string) {
  const updatedAt = syncedAt ?? new Date().toISOString();
  await Promise.all([
    AsyncStorage.setItem(userCacheKey(userId), JSON.stringify(state)),
    writeSyncMeta({
      userId,
      localUpdatedAt: updatedAt,
      remoteUpdatedAt: syncedAt,
    }),
  ]);
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

export async function chooseStateForUser(userId: string) {
  const [meta, remote, cached] = await Promise.all([
    readSyncMeta(),
    getRemoteSnapshot(userId),
    readCachedStateForUser(userId),
  ]);

  if (remote) {
    await writeCachedStateForUser(userId, remote.state, remote.updatedAt);
    return { state: remote.state, shouldPushLocal: false, remoteUpdatedAt: remote.updatedAt };
  }

  if (meta?.userId === userId && cached) {
    return { state: cached, shouldPushLocal: true, remoteUpdatedAt: undefined };
  }

  return { state: createInitialState(), shouldPushLocal: true, remoteUpdatedAt: undefined };
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

  await writeCachedStateForUser(userId, state, updatedAt);

  return updatedAt;
}
