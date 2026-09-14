import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { AdminProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  adminProfile: AdminProfile | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_ADMIN_PROFILE: AdminProfile = {
  id: 'demo-admin-id',
  userId: 'demo-admin-user-id',
  fullName: 'Administrator (Demo)',
  email: 'admin@innovision.ai',
  role: 'super_admin',
  isActive: true,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  // Check if user is admin by looking up admin_profiles
  const checkAdmin = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setIsAdmin(false);
        setAdminProfile(null);
        return;
      }

      setIsAdmin(true);
      setAdminProfile({
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
        createdAt: data.created_at,
      });
    } catch {
      setIsAdmin(false);
      setAdminProfile(null);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: check local storage for demo session
      const demoAuth = localStorage.getItem('innovision_demo_auth');
      if (demoAuth === 'true') {
        setIsAdmin(true);
        setAdminProfile(DEMO_ADMIN_PROFILE);
      }
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          checkAdmin(s.user.id);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to get Supabase session:', err);
        setIsLoading(false);
      });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          checkAdmin(s.user.id);
        } else {
          setIsAdmin(false);
          setAdminProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // In demo mode, permit login
      setIsAdmin(true);
      setAdminProfile(DEMO_ADMIN_PROFILE);
      localStorage.setItem('innovision_demo_auth', 'true');
      return {};
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If Supabase authentication fails due to network or unconfigured tables, provide fallback option
        console.warn('Supabase auth failed:', error.message);
        return { error: error.message };
      }
      return {};
    } catch (err) {
      return { error: 'Authentication service unavailable' };
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('innovision_demo_auth');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return {};
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, isLoading, isAdmin, adminProfile,
      signIn, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
