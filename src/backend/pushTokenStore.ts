import { Platform } from 'react-native';

import { supabase } from './supabaseClient';

export async function upsertPushToken({
  enabled,
  token,
  userId,
}: {
  enabled: boolean;
  token: string;
  userId: string;
}) {
  if (!supabase) return;

  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
      enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' },
  );

  if (error) throw error;
}
