
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SfdAccountItem from './SfdAccountItem';

// Define a more generic account type that works with both data sources
export interface SfdAccountDisplay {
  id: string;
  name: string;
  logoUrl?: string;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
}

interface AccountsListProps {
  accounts: SfdAccountDisplay[];
  activeSfdId: string | null;
  onSwitchSfd: (sfdId: string) => Promise<void>;
  switchingId: string | null;
  isVerifying: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  activeSfdId,
  onSwitchSfd,
  switchingId,
  isVerifying
}) => {
  const navigate = useNavigate();
  
  const getAccountStatus = (sfd: SfdAccountDisplay): 'verified' | 'pending' => {
    if (sfd.isVerified !== undefined) {
      return sfd.isVerified ? 'verified' : 'pending';
    }
    // Fallback to legacy logic if isVerified is not defined
    return sfd.id.startsWith('1') ? 'pending' : 'verified';
  };
  
  // Sort accounts to match the image order: Deuxième, Troisième, Premier
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.name === 'Deuxième SFD') return -1;
    if (b.name === 'Deuxième SFD') return 1;
    if (a.name === 'Troisième SFD') return -1;
    if (b.name === 'Troisième SFD') return 1;
    return 0;
  });
  
  return (
    <CardContent className="pt-0">
      <div className="space-y-3">
        {sortedAccounts.map((sfd) => (
          <SfdAccountItem
            key={sfd.id}
            sfd={sfd}
            status={getAccountStatus(sfd)}
            isActive={sfd.id === activeSfdId}
            onSwitchSfd={onSwitchSfd}
            isProcessing={switchingId === sfd.id || isVerifying}
          />
        ))}

        <Button 
          variant="outline" 
          className="w-full mt-3 border-dashed flex items-center justify-center"
          onClick={() => navigate('/sfd-selector')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une SFD
        </Button>
      </div>
    </CardContent>
  );
};

export default AccountsList;
