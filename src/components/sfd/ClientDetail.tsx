
import React from 'react';
import ClientSavingsManagement from '@/components/sfd/ClientSavingsManagement';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { useSfdClientDetails } from '@/hooks/useSfdClientDetails';
import { ClientBalanceOperation } from '@/types/sfdClients';

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
  
  // Transform account data to match ClientSavingsAccount type
  const transformedAccount = account ? {
    ...account,
    client_id: clientId,
    status: 'active' as const, // Adding the missing status property
  } : null;
  
  // Transform transactions to match ClientBalanceOperation type
  const transformedTransactions: ClientBalanceOperation[] = transactions ? transactions.map(tx => ({
    id: tx.id,
    client_id: clientId,
    amount: tx.amount,
    operation_type: (tx.type as 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment'),
    description: tx.description || '',
    admin_id: tx.user_id, // Using user_id as admin_id as a fallback
    reference: tx.reference_id,
    created_at: tx.created_at || tx.date || new Date().toISOString()
  })) : [];
  
  return (
    <div>
      <ClientSavingsManagement 
        account={transformedAccount} 
        transactions={transformedTransactions} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ClientDetail;
