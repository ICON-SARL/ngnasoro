
import React from 'react';
import ClientSavingsManagement from '@/components/sfd/ClientSavingsManagement';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { useSfdClientDetails } from '@/hooks/useSfdClientDetails';

// Define props interface if it doesn't exist
interface ClientDetailProps {
  clientId: string;
  clientName: string;
  sfdId: string;
}

// Adjust the component to match required props
const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, clientName, sfdId }) => {
  // Fetch client account data
  const { account, transactions, isLoading } = useSavingsAccount(clientId);
  
  return (
    <div>
      <ClientSavingsManagement 
        account={account} 
        transactions={transactions || []} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ClientDetail;
