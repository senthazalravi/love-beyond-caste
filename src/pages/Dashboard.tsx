import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, LogOut, Filter, MapPin, Briefcase, Calendar, User, MessageCircle, Settings, Github } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import loveBackground from '@/assets/love-background.jpg';
import ProfileDetailsModal from '@/components/ProfileDetailsModal';

interface Profile {
  id: string;
  name: string;
  age?: number;
  date_of_birth?: string;
  profession: string;
  gender: string;
  photo_url?: string;
  marriage_timeframe: string;
  city: string;
  email: string;
  whatsapp_number: string;
  about_me?: string;
  is_admin: boolean;
}

const Dashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [filters, setFilters] = useState({
    city: '',
    age: '',
    gender: '',
    profession: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, filters]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('cnb_profiles')
        .select('*')
        .neq('user_id', user?.id || ''); // Exclude current user

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    if (filters.city) {
      filtered = filtered.filter(profile => 
        profile.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(profile => profile.gender === filters.gender);
    }

    if (filters.profession) {
      filtered = filtered.filter(profile => 
        profile.profession?.toLowerCase().includes(filters.profession.toLowerCase())
      );
    }

    if (filters.age && filters.age !== 'all') {
      const [minAge, maxAge] = filters.age.split('-').map(Number);
      filtered = filtered.filter(profile => {
        const age = profile.age || (profile.date_of_birth ? calculateAge(profile.date_of_birth) : 0);
        return age >= minAge && age <= maxAge;
      });
    }

    setFilteredProfiles(filtered);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-8 h-8 animate-pulse text-love-primary mx-auto mb-2" />
          <p>Loading beautiful profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${loveBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-love-primary/10 to-love-secondary/10 backdrop-blur-sm" />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-love-primary fill-current" />
            <h1 className="text-2xl font-bold text-love-primary">Caste No Bar</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/settings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm border-love-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-love-primary">
              <Filter className="w-5 h-5" />
              Find Your Perfect Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="Search by city"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Age Range</label>
                <Select value={filters.age} onValueChange={(value) => setFilters({ ...filters, age: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="18-25">18-25 years</SelectItem>
                    <SelectItem value="26-30">26-30 years</SelectItem>
                    <SelectItem value="31-35">31-35 years</SelectItem>
                    <SelectItem value="36-40">36-40 years</SelectItem>
                    <SelectItem value="41-50">41+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Gender</label>
                <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Profession</label>
                <Input
                  placeholder="Search by profession"
                  value={filters.profession}
                  onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="bg-white/95 backdrop-blur-sm border-love-primary/20 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Profile Photo */}
                  <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden bg-love-accent/30">
                    {profile.photo_url ? (
                      <img 
                        src={profile.photo_url} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-love-primary/60" />
                      </div>
                    )}
                    {profile.is_admin && (
                      <Badge className="absolute -top-2 -right-2 bg-love-primary text-white text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-love-primary">{profile.name}</h3>
                    <p className="text-gray-600">
                      {profile.age || (profile.date_of_birth ? calculateAge(profile.date_of_birth) : 'Age not specified')} years old
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.profession}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.city}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{profile.marriage_timeframe}</span>
                    </div>
                  </div>

                  {/* About Me Display */}
                  {profile.about_me && (
                    <div className="bg-love-accent/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 text-center leading-relaxed">
                        "{profile.about_me}"
                      </p>
                    </div>
                  )}

                  {/* Contact Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {profile.whatsapp_number && (
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white transition-colors"
                        onClick={() => {
                          const whatsappUrl = `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(profile.name)},%20I%20found%20your%20profile%20on%20Caste%20No%20Bar%20and%20would%20like%20to%20connect.`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    <Button 
                      className="flex-1 bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
                      onClick={() => {
                        setSelectedProfile(profile);
                        setIsModalOpen(true);
                      }}
                    >
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-love-primary/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-love-primary mb-2">No matches found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more profiles</p>
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="relative mt-16 py-8 bg-gradient-to-r from-love-primary/90 to-love-secondary/90 backdrop-blur-sm border-t border-white/20 rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-love-primary/20 to-love-secondary/20 rounded-t-3xl"></div>
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
              <a href="https://github.com/senthazalravi/love-beyond-caste.git" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-love-tertiary font-semibold underline decoration-white/50 hover:decoration-love-tertiary transition-colors">
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
              <span className="hidden sm:inline text-white/60">•</span>
              <p className="text-white/80">© 2025 Lovable Dev</p>
            </div>
          </div>
        </footer>

        {/* Profile Details Modal */}
        <ProfileDetailsModal
          profile={selectedProfile}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProfile(null);
          }}
          calculateAge={calculateAge}
        />
      </div>
    </div>
  );
};

export default Dashboard;