import React, { useState, useRef, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Heart, MapPin, Briefcase, Calendar, User, MessageCircle, Mail } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Float, Stars, OrbitControls } from '@react-three/drei';
import { useToast } from '@/hooks/use-toast';

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

interface ProfileDetailsModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  calculateAge: (dateOfBirth: string) => number;
}

// Three.js animated heart component
const AnimatedHeart = () => {
  const meshRef = useRef<any>();

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={0.5}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
    </Float>
  );
};

// Three.js animated particles
const FloatingParticles = () => {
  return (
    <group>
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]} scale={0.1}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 70%)`} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  profile,
  isOpen,
  onClose,
  calculateAge
}) => {
  const [copiedText, setCopiedText] = useState<string>('');
  const { toast } = useToast();

  if (!profile) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        duration: 2000,
      });
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const profileText = `Name: ${profile.name}
Age: ${profile.age || (profile.date_of_birth ? calculateAge(profile.date_of_birth) : 'Age not specified')} years
Profession: ${profile.profession}
City: ${profile.city}
Marriage Timeline: ${profile.marriage_timeframe}
About: ${profile.about_me || 'No description provided'}
WhatsApp: ${profile.whatsapp_number}
Email: ${profile.email}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[95vh] sm:h-[90vh] overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-gradient-to-r from-purple-300 to-pink-300 p-0">
        {/* Three.js Background Animation */}
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
              <FloatingParticles />
              <AnimatedHeart />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Suspense>
          </Canvas>
        </div>

        {/* Content */}
        <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-lg h-full flex flex-col">
          <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-purple-200">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Profile Details
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 px-4 sm:px-6">
            <div className="py-4">
              {/* Mobile-optimized layout */}
              <div className="space-y-6">
                {/* Profile Photo & Basic Info */}
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 border-4 border-gradient-to-r from-purple-400 to-pink-400">
                    {profile.photo_url ? (
                      <img 
                        src={profile.photo_url} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" />
                      </div>
                    )}
                    {profile.is_admin && (
                      <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {profile.name}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                      {profile.age || (profile.date_of_birth ? calculateAge(profile.date_of_birth) : 'Age not specified')} years old
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800 text-sm sm:text-base">Profession</span>
                    </div>
                    <p className="text-blue-700 text-sm sm:text-base">{profile.profession}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(profile.profession, 'Profession')}
                      className="mt-2 h-6 px-2 text-xs text-blue-600 hover:bg-blue-100"
                    >
                      {copiedText === 'Profession' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="font-semibold text-green-800 text-sm sm:text-base">Location</span>
                    </div>
                    <p className="text-green-700 text-sm sm:text-base">{profile.city}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(profile.city, 'Location')}
                      className="mt-2 h-6 px-2 text-xs text-green-600 hover:bg-green-100"
                    >
                      {copiedText === 'Location' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <span className="font-semibold text-purple-800 text-sm sm:text-base">Marriage Timeline</span>
                    </div>
                    <p className="text-purple-700 text-sm sm:text-base">{profile.marriage_timeframe}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(profile.marriage_timeframe, 'Marriage Timeline')}
                      className="mt-2 h-6 px-2 text-xs text-purple-600 hover:bg-purple-100"
                    >
                      {copiedText === 'Marriage Timeline' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 sm:p-4 rounded-lg border border-pink-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                      <span className="font-semibold text-pink-800 text-sm sm:text-base">Gender</span>
                    </div>
                    <p className="text-pink-700 text-sm sm:text-base">{profile.gender}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(profile.gender, 'Gender')}
                      className="mt-2 h-6 px-2 text-xs text-pink-600 hover:bg-pink-100"
                    >
                      {copiedText === 'Gender' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                {/* About Me */}
                {profile.about_me && (
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 sm:p-4 rounded-lg border border-rose-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                      <span className="font-semibold text-rose-800 text-sm sm:text-base">About Me</span>
                    </div>
                    <p className="text-rose-700 leading-relaxed text-sm sm:text-base">"{profile.about_me}"</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(profile.about_me || '', 'About Me')}
                      className="mt-2 h-6 px-2 text-xs text-rose-600 hover:bg-rose-100"
                    >
                      {copiedText === 'About Me' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-800 mb-3 text-sm sm:text-base">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <MessageCircle className="w-4 h-4 text-indigo-600" />
                        <span className="text-indigo-700 text-sm">WhatsApp: {profile.whatsapp_number}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(profile.whatsapp_number, 'WhatsApp')}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 h-8 px-3 text-xs self-start sm:self-auto"
                      >
                        {copiedText === 'WhatsApp' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copy
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span className="text-indigo-700 text-sm break-all">Email: {profile.email}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(profile.email, 'Email')}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 h-8 px-3 text-xs self-start sm:self-auto"
                      >
                        {copiedText === 'Email' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Action Buttons - Fixed at bottom */}
          <div className="p-4 sm:p-6 pt-4 border-t border-purple-200 bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(profile.name)},%20I%20found%20your%20profile%20on%20Caste%20No%20Bar%20and%20would%20like%20to%20connect.`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact on WhatsApp
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                onClick={() => copyToClipboard(profileText, 'Complete Profile')}
              >
                {copiedText === 'Complete Profile' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy All Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailsModal;