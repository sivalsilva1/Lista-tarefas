import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthState, Profile } from '../types/auth';
import type { Session } from '@supabase/supabase-js';

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const setSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ user: null, session: null, profile: null, loading: false });
      return;
    }
    const profile = await fetchProfile(session.user.id);
    setState({ user: session.user, session, profile, loading: false });
  }, []);

  useEffect(() => {
    // Carregar sessão existente ao iniciar
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  // ── Ações de autenticação ──────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        // Sem redirecionamento — login imediato
        emailRedirectTo: undefined,
      },
    });
    if (error) return error.message;
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?reset=true`,
    });
    if (error) return error.message;
    return null;
  }, []);

  const updateProfile = useCallback(async (displayName: string): Promise<string | null> => {
    if (!state.user) return 'Usuário não autenticado';
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', state.user.id);
    if (error) return error.message;
    setState((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, display_name: displayName } : null,
    }));
    return null;
  }, [state.user]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
}
