import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Phone } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import heartLogo from '@/assets/heart-logo.png';
import loveBackground from '@/assets/love-background.jpg';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate PIN
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate WhatsApp number (allow + sign)
    if (!whatsappNumber || whatsappNumber.length < 10) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "Please enter a valid WhatsApp number",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!isLogin && pin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PIN and confirmation PIN don't match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await signIn(whatsappNumber, pin);
      } else {
        result = await signUp(whatsappNumber, pin);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: isLogin ? "Welcome back!" : "Account created successfully!",
        });
        
        // Check if user has completed profile setup
        const { data: profileData } = await supabase
          .from('cnb_profiles')
          .select('name, profession, city')
          .eq('whatsapp_number', whatsappNumber)
          .single();
        
        // If profile is incomplete (missing required fields), go to profile setup
        if (!profileData?.name || !profileData?.profession || !profileData?.city) {
          navigate('/profile-setup');
        } else {
          // Profile is complete, go to dashboard
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${loveBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-love-primary/10 to-love-secondary/10 backdrop-blur-sm" />
      
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-love-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={heartLogo} alt="Caste No Bar" className="w-16 h-16" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-love-primary flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 fill-current" />
              Caste No Bar
            </CardTitle>
            <CardDescription className="text-gray-600">
              Love Beyond Boundaries
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="pl-10 text-left border-love-primary/30 focus:border-love-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">4-Digit PIN</label>
              <Input
                type="password"
                placeholder="0000"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="text-left text-xl tracking-widest border-love-primary/30 focus:border-love-primary"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm PIN</label>
                <Input
                  type="password"
                  placeholder="0000"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="text-left text-xl tracking-widest border-love-primary/30 focus:border-love-primary"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white font-semibold py-3"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-love-primary hover:text-love-secondary font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;