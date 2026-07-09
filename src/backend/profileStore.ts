import { AuthUser } from '../auth/types';
import { supabase } from './supabaseClient';

export async function upsertProfile(user: AuthUser) {
  if (!supabase || !user.supabaseUserId) return;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.supabaseUserId,
      provider: user.provider,
      email: user.email ?? null,
      display_name: user.name ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}
