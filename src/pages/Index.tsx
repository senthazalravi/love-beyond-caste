import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, Globe } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import heartLogo from '@/assets/heart-logo.png';
import loveBackground from '@/assets/love-background.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUserCount();
  }, []);

  const fetchUserCount = async () => {
    try {
      const { count, error } = await supabase
        .from('cnb_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching user count:', error);
        setUserCount(500); // Fallback number
      } else {
        setUserCount(count || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setUserCount(500); // Fallback number
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${loveBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-love-primary/20 to-love-secondary/20 backdrop-blur-sm" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <img src={heartLogo} alt="Caste No Bar" className="w-20 h-20" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Caste No Bar
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              Love Beyond Boundaries • Unity in Diversity • Progressive Matrimony
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/90 backdrop-blur-sm border-love-primary/30">
                <CardHeader className="text-center">
                  <Users className="w-8 h-8 mx-auto text-love-primary mb-2" />
                  <CardTitle className="text-love-primary">No Caste Barriers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Connect with people based on values, not caste or religion
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-love-primary/30">
                <CardHeader className="text-center">
                  <Shield className="w-8 h-8 mx-auto text-love-primary mb-2" />
                  <CardTitle className="text-love-primary">Progressive Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    No dowry commitment and medical transparency for healthy relationships
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-love-primary/30">
                <CardHeader className="text-center">
                  <Globe className="w-8 h-8 mx-auto text-love-primary mb-2" />
                  <CardTitle className="text-love-primary">Modern Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Simple WhatsApp-based authentication and smart matching
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white text-lg px-8 py-3"
              >
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Find Your Soulmate
              </Button>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/30">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Heart className="w-6 h-6 text-white fill-current animate-pulse" />
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {userCount.toLocaleString()}+
                  </span>
                  <Heart className="w-6 h-6 text-white fill-current animate-pulse" />
                </div>
                <p className="text-white/90 text-lg font-semibold">
                  Hearts Connected • Souls United
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Join our growing community of love seekers
                </p>
              </div>
              
              <p className="text-white/80 text-sm">
                Find meaningful connections beyond traditional boundaries
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="relative mt-16 py-8 bg-gradient-to-r from-love-primary/90 to-love-secondary/90 backdrop-blur-sm border-t border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-love-primary/20 to-love-secondary/20"></div>
          <div className="relative z-10 text-center text-white space-y-4">
            <div className="flex items-center justify-center gap-2 text-xl font-semibold">
              <Heart className="w-6 h-6 fill-current animate-pulse" />
              <span>Caste No Bar</span>
              <Heart className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <p className="text-white/90 text-lg font-medium">Love Beyond Boundaries</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <p>Created with ❤️ by <a href="https://x.com/senthazalravi" target="_blank" rel="noopener noreferrer" className="text-white hover:text-love-tertiary font-semibold underline decoration-white/50 hover:decoration-love-tertiary transition-colors">@senthazalravi</a></p>
              <span className="hidden sm:inline text-white/60">•</span>
              <p className="text-white/80">© 2025 Lovable Dev</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
