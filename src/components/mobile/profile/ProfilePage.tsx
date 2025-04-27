
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingIndicator from '@/components/ui/loading-indicator';
import ErrorMessage from '@/components/ui/error-message';
import ProfileHeader from './ProfileHeader';
import SfdAccountsSection from './SfdAccountsSection';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import ClientCodeSection from '@/components/mobile/account/ClientCodeSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sfdData, activeSfdId, switchActiveSfd } = useSfdDataAccess();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
            
        if (error) {
          throw error;
        }

        if (data) {
          console.log('Profile data loaded:', data);
          setProfileData(data);
        }
      } catch (err) {
        console.error('Error in profile data fetch:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user?.id]);

  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };

  const handleLogout = async () => {
    try {
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      await signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <ErrorMessage 
          title="Accès non autorisé" 
          description="Vous devez être connecté pour accéder à cette page." 
          showRetry={false}
        />
      </div>
    );
  }

  const mergedUserData = isLoading ? null : { 
    ...user, 
    ...profileData,
    phone: profileData?.phone || user?.phone || user?.user_metadata?.phone 
  };

  return (
    <div className="pb-20">
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      <ProfileHeader />

      {isLoading ? (
        <LoadingIndicator message="Chargement du profil..." />
      ) : error ? (
        <div className="p-4">
          <ErrorMessage 
            title="Erreur" 
            description={error}
            onRetry={() => window.location.reload()} 
          />
        </div>
      ) : (
        <Tabs 
          defaultValue={activeTab} 
          className="w-full mt-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="accounts">Comptes</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="px-4">
            <ClientCodeSection />
            <SfdAccountsSection 
              sfdData={sfdData} 
              activeSfdId={activeSfdId} 
              onSwitchSfd={switchActiveSfd} 
            />
          </TabsContent>
          
          <TabsContent value="security" className="px-4">
            <SecuritySection />
            <NotificationsSection />
            <AdvancedSettingsSection onLogout={handleLogout} />
          </TabsContent>
          
          <TabsContent value="profile" className="px-4">
            <PersonalInfoSection user={mergedUserData} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProfilePage;
