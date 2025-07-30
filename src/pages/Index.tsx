import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, Globe } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import heartLogo from '@/assets/heart-logo.png';
import loveBackground from '@/assets/love-background.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
              
              <p className="text-white/80 text-sm">
                Join thousands finding love beyond traditional boundaries
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-white/80 space-y-2">
          <p>Created by <a href="https://x.com/senthazalravi" target="_blank" rel="noopener noreferrer" className="text-love-primary hover:underline">@senthazalravi</a></p>
          <p>Copyright 2025 Lovable Dev</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
