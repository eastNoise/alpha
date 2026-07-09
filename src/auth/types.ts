export type AuthProvider = 'apple' | 'google';

export interface AuthUser {
  id: string;
  provider: AuthProvider;
  email?: string | null;
  name?: string | null;
  remoteBacked?: boolean;
  supabaseUserId?: string | null;
}
