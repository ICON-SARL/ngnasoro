
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import SfdList from '@/components/mobile/sfd/SfdList';
import SfdSelector from '@/components/mobile/profile/sfd-accounts/SfdSelector';
import { useAuth } from '@/hooks/useAuth';

const SfdSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const selectedSfdId = location.state?.selectedSfdId;

  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center text-[#0D6A51]">
            {selectedSfdId ? "Détails de la SFD" : "SFDs Disponibles"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          {selectedSfdId && user ? (
            <SfdSelector userId={user.id} />
          ) : (
            <SfdList />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdSelectorPage;
