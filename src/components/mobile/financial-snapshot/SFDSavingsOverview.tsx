
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSfdAccountsApi } from '@/hooks/useSfdAccountsApi';
import NoAccountState from '../sfd-savings/NoAccountState';
import { useAuth } from '@/hooks/useAuth';

const SFDSavingsOverview: React.FC = () => {
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const { getAccounts, isLoading } = useSfdAccountsApi();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const checkAccountStatus = async () => {
      if (!user) return;
      
      const accounts = await getAccounts();
      setHasAccount(accounts.length > 0);
    };
    
    checkAccountStatus();
  }, [user]);
  
  const goToSelector = () => {
    navigate('/sfd-selector');
  };
  
  if (hasAccount === null || isLoading) {
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
  
  if (hasAccount === false) {
    return <NoAccountState />;
  }
  
  // Render account information if the user has an account
  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        {/* This will be replaced with actual account data in the future */}
        <div className="text-center py-4">
          <h3 className="text-lg font-medium mb-2">Compte SFD connecté</h3>
          <p className="text-sm text-gray-500 mb-4">
            Consultez vos informations de compte SFD.
          </p>
          <Button 
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={() => navigate('/mobile-flow/savings')}
          >
            Voir mon compte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
