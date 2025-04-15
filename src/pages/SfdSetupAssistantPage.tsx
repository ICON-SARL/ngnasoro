import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SfdSetupAssistantPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSfdId, sfdData, isLoading, associateUserWithSfd, switchActiveSfd } = useSfdDataAccess();
  const { toast } = useToast();
  const [availableSfds, setAvailableSfds] = useState<any[]>([]);
  const [loadingAvailableSfds, setLoadingAvailableSfds] = useState(true);
  const [activeTab, setActiveTab] = useState('existing');
  const [creatingRequest, setCreatingRequest] = useState(false);
  
  useEffect(() => {
    const fetchAllSfds = async () => {
      if (!user) return;
      
      setLoadingAvailableSfds(true);
      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
          
        if (error) throw error;
        
        const userSfdIds = sfdData.map(sfd => sfd.id);
        const filteredSfds = data?.filter(sfd => !userSfdIds.includes(sfd.id)) || [];
        
        setAvailableSfds(filteredSfds);
      } catch (error) {
        console.error('Error fetching available SFDs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des SFDs disponibles",
          variant: "destructive"
        });
      } finally {
        setLoadingAvailableSfds(false);
      }
    };
    
    fetchAllSfds();
  }, [user, sfdData, toast]);
  
  const handleAssociateSfd = async (sfdId: string) => {
    if (!user) return;
    
    const result = await associateUserWithSfd(sfdId);
    
    if (result) {
      toast({
        title: "Association réussie",
        description: "Vous avez été associé à cette SFD avec succès",
      });
      
      setTimeout(() => navigate(-1), 1500);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de vous associer à cette SFD",
        variant: "destructive"
      });
    }
  };
  
  const handleRequestAccess = async (sfdId: string) => {
    if (!user) return;
    
    setCreatingRequest(true);
    try {
      const { error } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: user.user_metadata?.full_name || user.email,
          email: user.email,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'accès à la SFD a été envoyée. Un administrateur va la traiter.",
      });
      
      const { data, error: fetchError } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active');
        
      if (!fetchError && data) {
        const userSfdIds = sfdData.map(sfd => sfd.id);
        const filteredSfds = data.filter(sfd => !userSfdIds.includes(sfd.id));
        setAvailableSfds(filteredSfds);
      }
    } catch (error) {
      console.error('Error requesting SFD access:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande d'accès",
        variant: "destructive"
      });
    } finally {
      setCreatingRequest(false);
    }
  };
  
  const handleActivateSfd = async (sfdId: string) => {
    await switchActiveSfd(sfdId);
    
    toast({
      title: "SFD active modifiée",
      description: "Votre SFD active a été mise à jour",
    });
    
    setTimeout(() => navigate(-1), 1000);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Configuration de votre compte SFD</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Alert className="mb-6">
            <AlertTitle>Information importante</AlertTitle>
            <AlertDescription>
              Pour utiliser les fonctionnalités de gestion de clients, vous devez être associé à au moins une SFD.
              {sfdData.length === 0 && " Actuellement, votre compte n'est associé à aucune SFD."}
            </AlertDescription>
          </Alert>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="existing">Mes SFDs</TabsTrigger>
              <TabsTrigger value="available">Ajouter une SFD</TabsTrigger>
            </TabsList>
            
            <TabsContent value="existing">
              <h2 className="text-xl font-semibold mb-4">Mes associations SFD ({sfdData.length})</h2>
              
              {sfdData.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucune SFD associée</p>
                      <p className="text-muted-foreground mb-4">
                        Vous n'êtes actuellement associé à aucune SFD. 
                        Utilisez l'onglet "Ajouter une SFD" pour vous connecter à une SFD.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('available')}
                        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une SFD
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sfdData.map(sfd => (
                    <Card key={sfd.id} className={activeSfdId === sfd.id ? "border-[#0D6A51]" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{sfd.name}</CardTitle>
                          {activeSfdId === sfd.id && (
                            <Badge className="bg-[#0D6A51]">Active</Badge>
                          )}
                        </div>
                        <CardDescription>
                          {sfd.region ? `${sfd.region} · ` : ""}{sfd.code}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardFooter className="pt-2">
                        {activeSfdId !== sfd.id ? (
                          <Button 
                            onClick={() => handleActivateSfd(sfd.id)}
                            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                          >
                            Activer cette SFD
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            SFD active
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available">
              <h2 className="text-xl font-semibold mb-4">SFDs disponibles</h2>
              
              {loadingAvailableSfds ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableSfds.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium">Vous êtes déjà associé à toutes les SFDs disponibles</p>
                      <p className="text-muted-foreground">
                        Il n'y a pas d'autres SFDs auxquelles vous pouvez vous associer.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSfds.map(sfd => (
                    <Card key={sfd.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{sfd.name}</CardTitle>
                        <CardDescription>
                          {sfd.region ? `${sfd.region} · ` : ""}{sfd.code}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                          {sfd.description || "Institution de microfinance"}
                        </p>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          onClick={() => handleRequestAccess(sfd.id)}
                          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                          disabled={creatingRequest}
                        >
                          {creatingRequest && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          Demander l'accès
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SfdSetupAssistantPage;
