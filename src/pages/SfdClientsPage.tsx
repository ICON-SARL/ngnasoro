
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ClientList from '@/components/mobile/sfd-clients/ClientList';

const SfdClientsPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  
  // Redirect to SFD setup if no active SFD
  React.useEffect(() => {
    if (!activeSfdId) {
      navigate('/mobile-flow/create-sfd');
    }
  }, [activeSfdId, navigate]);
  
  if (!activeSfdId) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="container mx-auto py-4 px-4 max-w-md">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/mobile-flow/main')}
      >
        ← Retour au tableau de bord
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center text-[#0D6A51]">
            Gestion des Clients SFD
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <ClientList />
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdClientsPage;
