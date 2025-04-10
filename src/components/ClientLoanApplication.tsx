import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';

const ClientLoanApplication = () => {
  const { activeSfdId, getActiveSfdData } = useSfdDataAccess();
  const [activeSfdName, setActiveSfdName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSfdInfo = async () => {
      if (activeSfdId) {
        try {
          setIsLoading(true);
          const sfdData = await getActiveSfdData();
          if (sfdData) {
            setActiveSfdName(sfdData.name);
          }
        } catch (error) {
          console.error("Error fetching SFD data:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les informations de la SFD",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchSfdInfo();
  }, [activeSfdId, getActiveSfdData, toast]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!activeSfdId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demande de Prêt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 mb-4">
            Vous devez d'abord connecter votre compte à une SFD pour pouvoir faire une demande de prêt.
          </p>
          <div className="flex justify-center">
            <Button variant="outline">Connecter une SFD</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demande de Prêt - {activeSfdName}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Application form content would go here */}
        <p>Le formulaire de demande de prêt sera bientôt disponible.</p>
      </CardContent>
    </Card>
  );
};

export default ClientLoanApplication;
