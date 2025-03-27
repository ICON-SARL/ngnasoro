
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SfdAccountItem from './SfdAccountItem';
import { SfdData } from '@/hooks/useSfdDataAccess';

interface AccountsListProps {
  accounts: SfdData[];
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
  
  const getAccountStatus = (sfdId: string): 'verified' | 'pending' => {
    return sfdId.startsWith('1') ? 'pending' : 'verified';
  };
  
  return (
    <CardContent className="pt-0">
      <div className="space-y-3">
        {accounts.map((sfd) => (
          <SfdAccountItem
            key={sfd.id}
            sfd={sfd}
            status={getAccountStatus(sfd.id)}
            isActive={sfd.id === activeSfdId}
            onSwitchSfd={onSwitchSfd}
            isProcessing={switchingId === sfd.id || isVerifying}
          />
        ))}

        <Button 
          variant="outline" 
          className="w-full mt-3 border-dashed"
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
