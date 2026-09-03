import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

interface TeacherAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTeacherAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

export const TeacherAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      // Check local session storage for mock teacher login in preview/offline mode
      const mockTeacher = sessionStorage.getItem('mahmoud_teacher_authenticated');
      if (mockTeacher === 'true') {
        setUser({
          id: 'teacher-mahmoud-001',
          email: 'mahmoud@teaching.alazhar',
          app_metadata: {},
          user_metadata: { name: 'Ustadh Mahmoud' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as any);
      }
      setLoading(false);
      return;
    }

    // Real Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both your email address and password.' };
    }

    if (!isConfigured) {
      // Demo / development teacher authentication
      if (email.toLowerCase().includes('mahmoud') || email.toLowerCase().includes('admin') || email.toLowerCase() === 'mhmwdlwany4222@gmail.com') {
        sessionStorage.setItem('mahmoud_teacher_authenticated', 'true');
        setUser({
          id: 'teacher-mahmoud-001',
          email: email,
          app_metadata: {},
          user_metadata: { name: 'Ustadh Mahmoud' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as any);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Invalid credentials. Only Ustadh Mahmoud is authorized to access the teacher management foundation.',
        };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected authentication error occurred.' };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('mahmoud_teacher_authenticated');
    setUser(null);
    setSession(null);
  };

  return (
    <TeacherAuthContext.Provider
      value={{
        user,
        session,
        loading,
        isTeacherAuthenticated: Boolean(user),
        signIn,
        signOut,
        isConfigured,
      }}
    >
      {children}
    </TeacherAuthContext.Provider>
  );
};

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error('useTeacherAuth must be used within a TeacherAuthProvider');
  }
  return context;
};
