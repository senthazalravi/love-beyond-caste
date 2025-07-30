import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (whatsappNumber: string, pin: string) => Promise<{ error?: string }>;
  signUp: (whatsappNumber: string, pin: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (whatsappNumber: string, pin: string) => {
    try {
      // Create a dummy email for Supabase auth
      const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
      const password = `${whatsappNumber}${pin}`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('cnb_profiles')
          .insert({
            user_id: data.user.id,
            whatsapp_number: whatsappNumber,
            password_pin: pin,
            name: '',
          });

        if (profileError) {
          return { error: profileError.message };
        }
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (whatsappNumber: string, pin: string) => {
    try {
      // Check if this is admin
      if (whatsappNumber === '+46733115830' && pin === '0000') {
        const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
        const password = `${whatsappNumber}${pin}`;
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }
        return {};
      }

      // Check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('cnb_profiles')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .eq('password_pin', pin)
        .single();

      if (profileError || !profile) {
        return { error: 'Invalid WhatsApp number or PIN' };
      }

      // Sign in with Supabase
      const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
      const password = `${whatsappNumber}${pin}`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};