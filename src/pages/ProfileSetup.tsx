import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Upload } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import loveBackground from '@/assets/love-background.jpg';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    whatsappNumber: '',
    profession: '',
    gender: '',
    marriageTimeframe: '',
    city: '',
    email: '',
    consentNoDowry: false,
    consentMedicalReport: false,
    consentAnyCaste: false,
    consentAnyReligion: false,
    consentShareContact: false,
  });
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Photo selected:', file.name, file.size, file.type);
      setPhoto(file);
      toast({
        title: "Photo Selected",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const uploadPhoto = async (file: File, userId: string) => {
    try {
      console.log('Starting photo upload for user:', userId);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;
      
      console.log('Uploading to:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cnb-photos')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: urlData } = supabase.storage
        .from('cnb-photos')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate required consents
    if (!formData.consentNoDowry || !formData.consentMedicalReport || 
        !formData.consentAnyCaste || !formData.consentAnyReligion || 
        !formData.consentShareContact) {
      toast({
        title: "Consent Required",
        description: "All consent checkboxes must be checked to proceed",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      let photoUrl = '';
      if (photo) {
        console.log('Uploading photo for user:', user.id);
        photoUrl = await uploadPhoto(photo, user.id);
        console.log('Photo uploaded successfully, URL:', photoUrl);
      }

      const { error } = await supabase
        .from('cnb_profiles')
        .update({
          name: formData.name,
          age: parseInt(formData.age),
          whatsapp_number: formData.whatsappNumber,
          profession: formData.profession,
          gender: formData.gender,
          marriage_timeframe: formData.marriageTimeframe,
          city: formData.city,
          email: formData.email,
          photo_url: photoUrl,
          consent_no_dowry: formData.consentNoDowry,
          consent_medical_report: formData.consentMedicalReport,
          consent_any_caste: formData.consentAnyCaste,
          consent_any_religion: formData.consentAnyReligion,
          consent_share_contact: formData.consentShareContact,
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Profile completed successfully",
      });

      navigate('/dashboard');
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
      className="min-h-screen p-4"
      style={{
        backgroundImage: `url(${loveBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-love-primary/10 to-love-secondary/10 backdrop-blur-sm" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <Card className="bg-white/95 backdrop-blur-sm border-love-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-love-primary flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 fill-current" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name/Nickname *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Age *</label>
                  <Input
                    type="number"
                    min="18"
                    max="80"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Your age"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profession *</label>
                  <Input
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="Your profession"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender *</label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Your city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Marriage Timeframe *</label>
                  <Select value={formData.marriageTimeframe} onValueChange={(value) => setFormData({ ...formData, marriageTimeframe: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you want to get married?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Within 6 months">Within 6 months</SelectItem>
                      <SelectItem value="6-12 months">6-12 months</SelectItem>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="2+ years">2+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Number *</label>
                  <Input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        {photo ? photo.name : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                  {photo && (
                    <span className="text-sm text-green-600">✓ Photo ready to upload</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-4 bg-love-accent/30 rounded-lg">
                <h3 className="font-semibold text-love-primary">Required Consents</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-dowry"
                      checked={formData.consentNoDowry}
                      onCheckedChange={(checked) => setFormData({ ...formData, consentNoDowry: !!checked })}
                    />
                    <label htmlFor="no-dowry" className="text-sm">
                      I will not take or give dowry *
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medical-report"
                      checked={formData.consentMedicalReport}
                      onCheckedChange={(checked) => setFormData({ ...formData, consentMedicalReport: !!checked })}
                    />
                    <label htmlFor="medical-report" className="text-sm">
                      I will submit my full body medical report *
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="any-caste"
                      checked={formData.consentAnyCaste}
                      onCheckedChange={(checked) => setFormData({ ...formData, consentAnyCaste: !!checked })}
                    />
                    <label htmlFor="any-caste" className="text-sm">
                      I am okay with any caste *
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="any-religion"
                      checked={formData.consentAnyReligion}
                      onCheckedChange={(checked) => setFormData({ ...formData, consentAnyReligion: !!checked })}
                    />
                    <label htmlFor="any-religion" className="text-sm">
                      I am okay with any religion *
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share-contact"
                      checked={formData.consentShareContact}
                      onCheckedChange={(checked) => setFormData({ ...formData, consentShareContact: !!checked })}
                    />
                    <label htmlFor="share-contact" className="text-sm">
                      I consent to share my WhatsApp and Email with potential matches *
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;