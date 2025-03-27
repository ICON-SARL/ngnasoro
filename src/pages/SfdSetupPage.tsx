
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SfdAccountRequest from '@/components/SfdAccountRequest';
import SfdAccountsSection from '@/components/mobile/profile/SfdAccountsSection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="manage">Mes comptes</TabsTrigger>
              <TabsTrigger value="create">Créer un compte</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage">
              <SfdAccountsSection 
                onSwitchSfd={handleSwitchSfd}
              />
            </TabsContent>
            
            <TabsContent value="create">
              <SfdAccountRequest />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdSetupPage;
