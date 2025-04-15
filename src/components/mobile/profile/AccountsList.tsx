
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Check, Loader2 } from 'lucide-react';
import AddSfdButton from './sfd-accounts/AddSfdButton';

interface AccountsListProps {
  accounts: any[];
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => void;
  switchingId?: string;
  isVerifying?: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  activeSfdId,
  onSwitchSfd,
  switchingId,
  isVerifying
}) => {
  return (
    <div className="space-y-3 p-4">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className={`relative overflow-hidden transition-all hover:shadow-md ${
            activeSfdId === account.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSwitchSfd?.(account.id)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-base">{account.name}</h3>
                <p className="text-sm text-muted-foreground">{account.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {account.status === 'active' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              )}
              {isVerifying && switchingId === account.id && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <AddSfdButton />
    </div>
  );
};

export default AccountsList;
