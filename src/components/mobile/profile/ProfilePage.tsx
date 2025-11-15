
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from './ProfileHeader';
import SfdAccountsSection from './SfdAccountsSection';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, Shield, User } from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const { user } = useAuth();

  return (
    <div className="pb-20 bg-background min-h-screen">
      <ProfileHeader />

      <Tabs 
        defaultValue={activeTab} 
        className="w-full mt-6 px-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 gap-2 bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger 
            value="accounts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-primary/10 rounded-lg"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Comptes
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-primary/10 rounded-lg"
          >
            <Shield className="mr-2 h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger 
            value="profile"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-primary/10 rounded-lg"
          >
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          <SfdAccountsSection />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <SecuritySection />
          <NotificationsSection />
          <AdvancedSettingsSection />
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4">
          {user && <PersonalInfoSection user={user} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
