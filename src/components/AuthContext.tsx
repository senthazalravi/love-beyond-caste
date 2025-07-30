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
        console.log('Auth state change:', event, session);
        // Allow unconfirmed users to proceed
        if (session && session.user) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      // Allow unconfirmed users to proceed
      if (session && session.user) {
        setSession(session);
        setUser(session.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (whatsappNumber: string, pin: string) => {
    try {
      // Create a dummy email for Supabase auth
      const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
      const password = `${whatsappNumber}${pin}`;
      
      console.log('Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            whatsapp_number: whatsappNumber
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error: error.message };
      }

      console.log('Signup successful:', data);

      // Even if email is not confirmed, proceed with profile creation
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
          console.error('Profile creation error:', profileError);
          return { error: profileError.message };
        }
        
        console.log('Profile created successfully');
        
        // If user is confirmed immediately or we have a session, use it
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      }

      return {};
    } catch (error: any) {
      console.error('Signup catch error:', error);
      return { error: error.message };
    }
  };

  const signIn = async (whatsappNumber: string, pin: string) => {
    try {
      console.log('Attempting signin for:', whatsappNumber);
      
      // Check if this is admin
      if (whatsappNumber === '+46733115830' && pin === '0000') {
        const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
        const password = `${whatsappNumber}${pin}`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Admin signin error:', error);
          return { error: error.message };
        }
        
        console.log('Admin signin successful:', data);
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
        console.error('Profile lookup error:', profileError);
        return { error: 'Invalid WhatsApp number or PIN' };
      }

      console.log('Profile found:', profile);

      // Sign in with Supabase
      const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
      const password = `${whatsappNumber}${pin}`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signin error:', error);
        // If error is about email confirmation, try to handle it gracefully
        if (error.message.includes('email') && error.message.includes('confirm')) {
          // Still set the user if we have the profile
          return { error: 'Please complete your profile setup' };
        }
        return { error: error.message };
      }

      console.log('Signin successful:', data);
      return {};
    } catch (error: any) {
      console.error('Signin catch error:', error);
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