
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AvailableSfdsList from '@/components/mobile/profile/sfd-accounts/AvailableSfdsList';
import AccountsSection from '@/components/mobile/profile/sfd-accounts/AccountsSection';

const SfdAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId, switchActiveSfd } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  
  const handleGoBack = () => {
    navigate('/mobile-flow/profile');
  };
  
  const handleSwitchSfd = async (sfdId: string): Promise<boolean> => {
    if (switchActiveSfd) {
      try {
        await switchActiveSfd(sfdId);
        return true;
      } catch (error) {
        console.error('Error switching SFD:', error);
        return false;
      }
    }
    return false;
  };
  
  return (
    <div className="pb-20 font-montserrat">
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
      
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-[#0D6A51] mb-4">Mes Comptes SFD</h1>
        
        <Tabs 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="accounts">Mes comptes</TabsTrigger>
            <TabsTrigger value="add">Ajouter une SFD</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts">
            <AccountsSection 
              onSwitchSfd={handleSwitchSfd}
            />
          </TabsContent>
          
          <TabsContent value="add">
            <AvailableSfdsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SfdAccountsPage;
