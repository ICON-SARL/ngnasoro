
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import NoAccountState from './NoAccountState';
import ClientAccountState from './ClientAccountState';
import SavingsHeader from './SavingsHeader';
import BalanceDisplay from './BalanceDisplay';
import AccountStats from './AccountStats';
import { SfdClient } from '@/types/sfdClients';

interface SavingsPageProps {
  refreshSavings?: () => void;
  onManageAccount?: () => void;
}

const SavingsPage: React.FC<SavingsPageProps> = ({ refreshSavings, onManageAccount }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in production this would come from an API
        setHasAccount(true);
        setBalance(250000);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données de compte');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);
  
  const handleRefreshBalance = async () => {
    setIsUpdating(true);
    setIsPending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would update the balance after refresh
      setBalance(prevBalance => prevBalance + Math.floor(Math.random() * 1000));
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sfdAccount', user?.id] });
    } catch (err) {
      console.error('Error refreshing balance:', err);
    } finally {
      setIsUpdating(false);
      
      // Show pending state for a bit longer to indicate sync is happening
      setTimeout(() => {
        setIsPending(false);
      }, 1000);
    }
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
  const handleManageAccount = () => {
    if (onManageAccount) {
      onManageAccount();
    }
  };
  
  // Render different states based on loading/error conditions
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState message={error} retryFn={refreshSavings || handleRefreshBalance} />;
  }
  
  if (!hasAccount) {
    return <NoAccountState />;
  }
  
  // Mock client data - making sure it conforms to SfdClient type
  const client: SfdClient = {
    id: 'client-1',
    full_name: user?.full_name || 'Client SFD', // Fixed: using full_name instead of name
    email: user?.email || 'client@example.com',
    phone: '+2250000000000',
    address: 'Abidjan, Côte d\'Ivoire',
    status: 'pending', // Fixed: using a valid status value from the SfdClient type
    created_at: new Date().toISOString(),
    sfd_id: 'default-sfd-id', // Added missing property
    kyc_level: 1 // Added missing property
  };
  
  return (
    <div className="p-4">
      <SavingsHeader 
        sfdName="COOPEC - Compte Épargne" 
        isHidden={isHidden} 
        toggleVisibility={toggleVisibility} 
      />
      
      <BalanceDisplay 
        isHidden={isHidden}
        balance={balance}
        currency="FCFA"
        isUpdating={isUpdating}
        isPending={isPending}
        refreshBalance={handleRefreshBalance}
      />
      
      <AccountStats 
        isHidden={isHidden}
        balance={balance}
      />
      
      <div className="mt-4">
        <ClientAccountState 
          client={client}
          balance={balance}
          currency="FCFA"
          onManageAccount={handleManageAccount}
        />
      </div>
    </div>
  );
};

export default SavingsPage;
