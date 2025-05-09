
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SfdAccountsSection from '@/components/mobile/profile/SfdAccountsSection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SfdSelector from '@/components/mobile/profile/sfd-accounts/SfdSelector';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/integrations/supabase/client';

const SfdSetupPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSfds, setHasSfds] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('create');
  const [hasRequests, setHasRequests] = useState(false);
  
  useEffect(() => {
    const checkUserSfds = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Check for existing SFDs
          const { data: sfds } = await supabase
            .from('user_sfds')
            .select('id')
            .eq('user_id', user.id);
            
          // Check for pending requests
          const { data: requests } = await supabase
            .from('sfd_clients')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'pending');
            
          // Ensure we're setting boolean values
          const hasExistingSfds = Boolean(sfds && sfds.length > 0) || Boolean(activeSfdId);
          const hasPendingRequests = Boolean(requests && requests.length > 0);
          
          setHasSfds(hasExistingSfds);
          setHasRequests(hasPendingRequests);
          
          // Set active tab based on user's state
          if (hasExistingSfds) {
            setActiveTab('manage');
          } else if (hasPendingRequests) {
            setActiveTab('requests');
          } else {
            setActiveTab('create');
          }
        } catch (error) {
          console.error('Error checking user SFDs:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkUserSfds();
  }, [user, activeSfdId]);
  
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
    toast({
      title: "Demande envoyée",
      description: "Votre demande a été envoyée avec succès",
    });
    setHasRequests(true);
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdSetupPage;
