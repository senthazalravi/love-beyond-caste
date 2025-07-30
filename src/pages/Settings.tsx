import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Upload, ArrowLeft, Settings as SettingsIcon, User, Bell } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import loveBackground from '@/assets/love-background.jpg';

interface Profile {
  name: string;
  age: number;
  whatsapp_number: string;
  profession: string;
  gender: string;
  marriage_timeframe: string;
  city: string;
  email: string;
  about_me: string;
  photo_url?: string;
  consent_no_dowry: boolean;
  consent_medical_report: boolean;
  consent_any_caste: boolean;
  consent_any_religion: boolean;
  consent_share_contact: boolean;
}

interface UserSettings {
  email_notifications: boolean;
  profile_visibility: boolean;
  show_whatsapp_publicly: boolean;
  show_email_publicly: boolean;
  theme_preference: string;
  language_preference: string;
}

const Settings = () => {
  const [profileData, setProfileData] = useState<Profile>({
    name: '',
    age: 18,
    whatsapp_number: '',
    profession: '',
    gender: '',
    marriage_timeframe: '',
    city: '',
    email: '',
    about_me: '',
    consent_no_dowry: false,
    consent_medical_report: false,
    consent_any_caste: false,
    consent_any_religion: false,
    consent_share_contact: false,
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    email_notifications: true,
    profile_visibility: true,
    show_whatsapp_publicly: true,
    show_email_publicly: false,
    theme_preference: 'system',
    language_preference: 'en',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setFetchingData(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('cnb_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfileData({
          name: profileData.name || '',
          age: profileData.age || 18,
          whatsapp_number: profileData.whatsapp_number || '',
          profession: profileData.profession || '',
          gender: profileData.gender || '',
          marriage_timeframe: profileData.marriage_timeframe || '',
          city: profileData.city || '',
          email: profileData.email || '',
          about_me: profileData.about_me || '',
          photo_url: profileData.photo_url,
          consent_no_dowry: profileData.consent_no_dowry || false,
          consent_medical_report: profileData.consent_medical_report || false,
          consent_any_caste: profileData.consent_any_caste || false,
          consent_any_religion: profileData.consent_any_religion || false,
          consent_share_contact: profileData.consent_share_contact || false,
        });
      }

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (settingsData) {
        setUserSettings({
          email_notifications: settingsData.email_notifications ?? true,
          profile_visibility: settingsData.profile_visibility ?? true,
          show_whatsapp_publicly: settingsData.show_whatsapp_publicly ?? true,
          show_email_publicly: settingsData.show_email_publicly ?? false,
          theme_preference: settingsData.theme_preference || 'system',
          language_preference: settingsData.language_preference || 'en',
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      toast({
        title: "Photo Selected",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const uploadPhoto = async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cnb-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cnb-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let photoUrl = profileData.photo_url;
      
      if (photo) {
        photoUrl = await uploadPhoto(photo, user.id);
      }

      const { error } = await supabase
        .from('cnb_profiles')
        .update({
          name: profileData.name,
          age: profileData.age,
          whatsapp_number: profileData.whatsapp_number,
          profession: profileData.profession,
          gender: profileData.gender,
          marriage_timeframe: profileData.marriage_timeframe,
          city: profileData.city,
          email: profileData.email,
          about_me: profileData.about_me,
          photo_url: photoUrl,
          consent_no_dowry: profileData.consent_no_dowry,
          consent_medical_report: profileData.consent_medical_report,
          consent_any_caste: profileData.consent_any_caste,
          consent_any_religion: profileData.consent_any_religion,
          consent_share_contact: profileData.consent_share_contact,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      
      setPhoto(null);
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

  const handleSettingsUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...userSettings,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Settings updated successfully",
      });
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

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-8 h-8 animate-pulse text-love-primary mx-auto mb-2" />
          <p>Loading your settings...</p>
        </div>
      </div>
    );
  }

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
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="icon"
            className="bg-white/95 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-love-primary" />
            <h1 className="text-2xl font-bold text-love-primary">Settings</h1>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-love-primary/20">
          <CardContent className="p-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name/Nickname *</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age *</label>
                    <Input
                      type="number"
                      min="18"
                      max="80"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) || 18 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profession *</label>
                    <Input
                      value={profileData.profession}
                      onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                      placeholder="Your profession"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender *</label>
                    <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
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
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="Your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Marriage Timeframe *</label>
                    <Select value={profileData.marriage_timeframe} onValueChange={(value) => setProfileData({ ...profileData, marriage_timeframe: value })}>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">WhatsApp Number *</label>
                    <Input
                      type="tel"
                      value={profileData.whatsapp_number}
                      onChange={(e) => setProfileData({ ...profileData, whatsapp_number: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">About Me *</label>
                  <Textarea
                    value={profileData.about_me}
                    onChange={(e) => setProfileData({ ...profileData, about_me: e.target.value })}
                    placeholder="Tell us about yourself, your values, what you're looking for in a partner..."
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {profileData.about_me.length}/500 characters
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
                      id="photo-upload-settings"
                    />
                    <label htmlFor="photo-upload-settings" className="cursor-pointer">
                      <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          {photo ? photo.name : "Change Photo"}
                        </span>
                      </Button>
                    </label>
                    {photo && (
                      <span className="text-sm text-green-600">✓ New photo ready</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-love-accent/30 rounded-lg">
                  <h3 className="font-semibold text-love-primary">Required Consents</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="no-dowry-settings"
                        checked={profileData.consent_no_dowry}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, consent_no_dowry: !!checked })}
                      />
                      <label htmlFor="no-dowry-settings" className="text-sm">
                        I will not take or give dowry
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="medical-report-settings"
                        checked={profileData.consent_medical_report}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, consent_medical_report: !!checked })}
                      />
                      <label htmlFor="medical-report-settings" className="text-sm">
                        I will submit my full body medical report
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="any-caste-settings"
                        checked={profileData.consent_any_caste}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, consent_any_caste: !!checked })}
                      />
                      <label htmlFor="any-caste-settings" className="text-sm">
                        I am okay with any caste
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="any-religion-settings"
                        checked={profileData.consent_any_religion}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, consent_any_religion: !!checked })}
                      />
                      <label htmlFor="any-religion-settings" className="text-sm">
                        I am okay with any religion
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="share-contact-settings"
                        checked={profileData.consent_share_contact}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, consent_share_contact: !!checked })}
                      />
                      <label htmlFor="share-contact-settings" className="text-sm">
                        I consent to share my WhatsApp and Email with potential matches
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProfileUpdate}
                  className="w-full bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-love-primary">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Profile Visibility</label>
                        <p className="text-xs text-gray-600">Make your profile visible to other users</p>
                      </div>
                      <Checkbox
                        checked={userSettings.profile_visibility}
                        onCheckedChange={(checked) => setUserSettings({ ...userSettings, profile_visibility: !!checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Show WhatsApp Publicly</label>
                        <p className="text-xs text-gray-600">Display WhatsApp number on your profile</p>
                      </div>
                      <Checkbox
                        checked={userSettings.show_whatsapp_publicly}
                        onCheckedChange={(checked) => setUserSettings({ ...userSettings, show_whatsapp_publicly: !!checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Show Email Publicly</label>
                        <p className="text-xs text-gray-600">Display email address on your profile</p>
                      </div>
                      <Checkbox
                        checked={userSettings.show_email_publicly}
                        onCheckedChange={(checked) => setUserSettings({ ...userSettings, show_email_publicly: !!checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Email Notifications</label>
                        <p className="text-xs text-gray-600">Receive email notifications about matches</p>
                      </div>
                      <Checkbox
                        checked={userSettings.email_notifications}
                        onCheckedChange={(checked) => setUserSettings({ ...userSettings, email_notifications: !!checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-love-primary">App Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Theme</label>
                      <Select value={userSettings.theme_preference} onValueChange={(value) => setUserSettings({ ...userSettings, theme_preference: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <Select value={userSettings.language_preference} onValueChange={(value) => setUserSettings({ ...userSettings, language_preference: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी</SelectItem>
                          <SelectItem value="ta">தமிழ்</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSettingsUpdate}
                  className="w-full bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Preferences"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;