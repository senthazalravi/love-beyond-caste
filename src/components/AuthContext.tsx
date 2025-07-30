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
      console.log('Attempting signup for:', whatsappNumber);
      
      // Check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('cnb_profiles')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .maybeSingle();

      if (existingProfile) {
        return { error: 'User with this WhatsApp number already exists' };
      }

      // Create a dummy email for Supabase auth
      const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
      const password = `${whatsappNumber}${pin}`;
      
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

      console.log('Supabase signup result:', { data, error });

      // Even if there's an email confirmation error, we'll create the profile
      // and treat it as successful since we're using WhatsApp/PIN authentication
      if (data?.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('cnb_profiles')
          .insert({
            user_id: data.user.id,
            whatsapp_number: whatsappNumber,
            password_pin: pin,
            name: '',
            email: email
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: profileError.message };
        }
        
        console.log('Profile created successfully');
        
        // Set session manually since email confirmation might block auto-login
        setUser({ id: data.user.id, email } as User);
        setSession({ user: { id: data.user.id, email } } as Session);
        
        return {};
      }

      // If user creation failed entirely, return the error
      if (error) {
        console.error('Signup error:', error);
        return { error: error.message };
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
      
      // First, check if user exists in our profiles table
      const { data: profile, error: profileError } = await supabase
        .from('cnb_profiles')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .eq('password_pin', pin)
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        return { error: 'Authentication failed' };
      }

      if (!profile) {
        console.log('No profile found for:', whatsappNumber);
        return { error: 'Invalid WhatsApp number or PIN' };
      }

      console.log('Profile found:', profile);

      // Check if this is admin
      if (whatsappNumber === '+46733115830' && pin === '0000') {
        // For admin, try Supabase auth
        const email = `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`;
        const password = `${whatsappNumber}${pin}`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.session) {
          console.log('Admin signin successful:', data);
          return {};
        }
      }

      // For regular users, set session manually since we're using WhatsApp/PIN auth
      const mockUser = { 
        id: profile.user_id, 
        email: profile.email || `${whatsappNumber.replace(/[^0-9]/g, '')}@cnb.app`,
        phone: whatsappNumber
      } as User;
      
      const mockSession = { 
        user: mockUser,
        access_token: 'mock-token',
        token_type: 'bearer'
      } as Session;

      setUser(mockUser);
      setSession(mockSession);

      console.log('Custom signin successful for:', whatsappNumber);
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