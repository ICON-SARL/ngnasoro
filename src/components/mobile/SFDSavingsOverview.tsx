
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Account } from '@/types/transactions';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

interface SFDSavingsOverviewProps {
  account?: Account | null;
}

const SFDSavingsOverview: React.FC<SFDSavingsOverviewProps> = ({ account }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savingsAccount } = useSfdAccounts();
  const [isAccountVerified, setIsAccountVerified] = useState(true);
  
  useEffect(() => {
    console.log("SFDSavingsOverview mounted with account:", account);
    // Vérifier si le compte SFD est validé
    if (account) {
      setIsAccountVerified(account.isVerified || account.isDefault);
    }
    
    // Simuler un chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [account]);
  
  const goToSelector = () => {
    navigate('/sfd-selector');
  };
  
  const goToSavings = () => {
    navigate('/mobile-flow/savings');
  };
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Si aucun compte n'est disponible
  if (!account) {
    return (
      <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="text-center py-6">
            <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
            <p className="text-sm text-gray-500 mb-4">
              Connectez-vous à un SFD pour accéder à vos services financiers.
            </p>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={goToSelector}
            >
              Connecter un SFD
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Afficher les informations du compte, mais cacher le solde si non validé
  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="text-center py-4">
          <h3 className="text-lg font-medium mb-2">Solde Disponible</h3>
          
          {isAccountVerified ? (
            <p className="text-2xl font-bold mb-4">
              {account.balance.toLocaleString()} {account.currency}
            </p>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <Lock className="h-6 w-6 mb-2 text-amber-500" />
              <p className="text-amber-600 font-medium">Compte en attente de validation</p>
              <p className="text-xs text-gray-500 mt-1">Le solde sera disponible après validation par la SFD</p>
            </div>
          )}
          
          <Button 
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={goToSavings}
          >
            Gérer mes fonds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
