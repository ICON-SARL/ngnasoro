
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { supabase } from '@/integrations/supabase/client';

interface Account {
  balance: number;
  currency: string;
  isVerified?: boolean;
  isDefault?: boolean;
  last_updated?: string;
}

interface SFDSavingsOverviewProps {
  account?: Account | null;
  onRefresh?: () => Promise<void>;
}

const SFDSavingsOverview: React.FC<SFDSavingsOverviewProps> = ({ account, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savingsAccount, refetchSavingsAccount } = useSfdAccounts();
  const [isAccountVerified, setIsAccountVerified] = useState(true);
  
  useEffect(() => {
    console.log("SFDSavingsOverview mounted with account:", account);
    // Check if the SFD account is validated
    if (account) {
      // Add default values if properties don't exist
      const verified = account.isVerified !== undefined ? account.isVerified : true;
      const isDefault = account.isDefault !== undefined ? account.isDefault : false;
      setIsAccountVerified(verified || isDefault);
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [account]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refetchSavingsAccount();
      }
    } catch (error) {
      console.error("Error refreshing account:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
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
  
  // If no account is available
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
  
  // Show account information, but hide the balance if not validated
  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="text-center py-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Solde Disponible</h3>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
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
          
          {account.last_updated && (
            <p className="text-xs text-gray-500 mt-2">
              Dernière mise à jour: {new Date(account.last_updated).toLocaleDateString()} {new Date(account.last_updated).toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
