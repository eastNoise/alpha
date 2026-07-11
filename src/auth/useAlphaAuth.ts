import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { upsertProfile } from '../backend/profileStore';
import { isSupabaseConfigured, supabase } from '../backend/supabaseClient';
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
  const googleConfigured = isSupabaseConfigured;

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
    if (!supabase || !isSupabaseConfigured) {
      setStatus('error');
      setMessage('로그인 서버 연결 설정이 필요합니다.');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url) throw error ?? new Error('Missing Google OAuth URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') {
        setStatus('idle');
        return;
      }

      const { queryParams } = Linking.parse(result.url);
      const code = queryParams?.code;
      if (typeof code !== 'string') throw new Error('Missing OAuth authorization code');

      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError || !sessionData.user) throw sessionError ?? new Error('Missing Google user');

      await persistUser(authUserFromSupabaseUser(sessionData.user));
      setStatus('idle');
    } catch (error) {
      console.error('Google sign-in failed', error);
      setStatus('error');
      setMessage('Google 로그인에 실패했습니다. 다시 시도해 주세요.');
    }
  }, [persistUser]);

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
