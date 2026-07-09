import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { upsertProfile } from '../backend/profileStore';
import { isSupabaseConfigured, supabase } from '../backend/supabaseClient';
import { GOOGLE_AUTH_CONFIG } from './config';
import { AuthUser } from './types';

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = 'alpha:v19:auth-user';

type AuthStatus = 'idle' | 'loading' | 'error';

function authUserFromSupabaseUser(user: User): AuthUser {
  const provider = user.app_metadata.provider === 'google' ? 'google' : 'apple';
  return {
    id: user.id,
    provider,
    email: user.email,
    name:
      typeof user.user_metadata.full_name === 'string'
        ? user.user_metadata.full_name
        : typeof user.user_metadata.name === 'string'
          ? user.user_metadata.name
          : user.email ?? 'ALPHA 사용자',
    remoteBacked: true,
    supabaseUserId: user.id,
  };
}

export function useAlphaAuth() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [message, setMessage] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);
  const googleConfigured = Boolean(GOOGLE_AUTH_CONFIG.iosClientId || GOOGLE_AUTH_CONFIG.webClientId);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_AUTH_CONFIG.iosClientId || 'alpha-placeholder.apps.googleusercontent.com',
    webClientId: GOOGLE_AUTH_CONFIG.webClientId || 'alpha-placeholder.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem(AUTH_STORAGE_KEY), AppleAuthentication.isAvailableAsync().catch(() => false)])
      .then(async ([raw, available]) => {
        if (!mounted) return;
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            setUser(authUserFromSupabaseUser(data.user));
          } else if (raw) {
            setUser(JSON.parse(raw) as AuthUser);
          }
        } else if (raw) {
          setUser(JSON.parse(raw) as AuthUser);
        }
        setAppleAvailable(available);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const nextUser = authUserFromSupabaseUser(session.user);
        setUser(nextUser);
        upsertProfile(nextUser).catch(() => undefined);
        AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser)).catch(() => undefined);
      } else {
        setUser(null);
        AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const persistUser = useCallback(async (nextUser: AuthUser) => {
    setUser(nextUser);
    if (nextUser.remoteBacked) await upsertProfile(nextUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const signInWithApple = useCallback(async () => {
    if (!appleAvailable) {
      setStatus('error');
      setMessage('이 기기에서는 Apple 로그인을 사용할 수 없습니다.');
      return null;
    }

    setStatus('loading');
    setMessage('');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const name = [credential.fullName?.familyName, credential.fullName?.givenName]
        .filter(Boolean)
        .join(' ');
      const nextUser: AuthUser = {
        id: credential.user,
        provider: 'apple',
        email: credential.email,
        name: name || credential.email || 'Apple 사용자',
      };
      if (supabase && credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
        if (data.user) {
          const remoteUser = authUserFromSupabaseUser(data.user);
          await persistUser(remoteUser);
          setStatus('idle');
          return remoteUser;
        }
      }
      await persistUser(nextUser);
      setStatus('idle');
      return nextUser;
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      if (code !== 'ERR_REQUEST_CANCELED') {
        setStatus('error');
        setMessage('Apple 로그인에 실패했습니다.');
      } else {
        setStatus('idle');
      }
      return null;
    }
  }, [appleAvailable, persistUser]);

  const signInWithGoogle = useCallback(async () => {
    if (!googleConfigured) {
      setStatus('error');
      setMessage('Google OAuth Client ID 설정이 필요합니다.');
      return;
    }
    if (!googleRequest) {
      setStatus('error');
      setMessage('Google 로그인을 준비하는 중입니다.');
      return;
    }

    setStatus('loading');
    setMessage('');
    const result = await promptGoogleAsync();
    if (result.type !== 'success') setStatus('idle');
  }, [googleConfigured, googleRequest, promptGoogleAsync]);

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const accessToken = googleResponse.authentication?.accessToken;
    const idToken = googleResponse.authentication?.idToken;
    if (!accessToken) {
      setStatus('error');
      setMessage('Google 인증 토큰을 받지 못했습니다.');
      return;
    }

    let mounted = true;
    if (supabase && isSupabaseConfigured) {
      if (!idToken) {
        setStatus('error');
        setMessage('Supabase Google 로그인을 위해 ID 토큰 설정이 필요합니다.');
        return undefined;
      }

      supabase.auth
        .signInWithIdToken({
          provider: 'google',
          token: idToken,
        })
        .then(async ({ data, error }) => {
          if (!mounted) return;
          if (error) throw error;
          if (!data.user) throw new Error('Missing Supabase user');
          await persistUser(authUserFromSupabaseUser(data.user));
          setStatus('idle');
        })
        .catch(() => {
          if (!mounted) return;
          setStatus('error');
          setMessage('Google 로그인에 실패했습니다.');
        });

      return () => {
        mounted = false;
      };
    }

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then(async (profile: { sub?: string; email?: string; name?: string }) => {
        if (!mounted) return;
        if (!profile.sub) throw new Error('Missing Google profile id');
        await persistUser({
          id: profile.sub,
          provider: 'google',
          email: profile.email,
          name: profile.name || profile.email || 'Google 사용자',
        });
        setStatus('idle');
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('error');
        setMessage('Google 로그인에 실패했습니다.');
      });

    return () => {
      mounted = false;
    };
  }, [googleResponse, persistUser]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setStatus('idle');
    setMessage('');
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return useMemo(
    () => ({
      appleAvailable,
      googleConfigured,
      message,
      ready,
      signInWithApple,
      signInWithGoogle,
      signOut,
      status,
      user,
    }),
    [
      appleAvailable,
      googleConfigured,
      message,
      ready,
      signInWithApple,
      signInWithGoogle,
      signOut,
      status,
      user,
    ],
  );
}
