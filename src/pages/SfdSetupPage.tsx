
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SfdAccountsSection from '@/components/mobile/profile/SfdAccountsSection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SfdSelector from '@/components/mobile/profile/sfd-accounts/SfdSelector';

const SfdSetupPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(activeSfdId ? 'manage' : 'create');
  
  const handleSwitchSfd = async (sfdId: string) => {
    toast({
      title: "SFD modifiée",
      description: "Votre compte SFD principal a été modifié",
    });
    
    setTimeout(() => {
      navigate('/mobile-flow/main');
    }, 1500);
    
    return true;
  };
  
  const handleRequestSent = () => {
    setActiveTab('manage');
  };
  
  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        ← Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center text-[#0D6A51]">
            Gestion des Comptes SFD
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="manage">Mes comptes</TabsTrigger>
              <TabsTrigger value="create">Ajouter une SFD</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage">
              <SfdAccountsSection 
                onSwitchSfd={handleSwitchSfd}
              />
            </TabsContent>
            
            <TabsContent value="create">
              {user && <SfdSelector userId={user.id} onRequestSent={handleRequestSent} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdSetupPage;
