import type { User, Session } from '@supabase/supabase-js';

export type { User, Session };

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export type AuthView = 'login' | 'register' | 'reset-password' | 'reset-sent';
