
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { CreditCard } from 'lucide-react';
import { SfdAccountType } from '../MultiSfdAccountsView';

interface SfdAccountCardProps {
  account: SfdAccountType;
}

const SfdAccountCard = ({ account }: SfdAccountCardProps) => {
  const getLogoUrl = (account: SfdAccountType): string => {
    return account.logoUrl || account.logo_url || '';
  };

  return (
    <Card className="min-w-[260px]">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            {getLogoUrl(account) ? (
              <img src={getLogoUrl(account)} alt={account.name} />
            ) : (
              <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary">
                {account.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          <div className="text-base font-semibold">{account.name}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Solde disponible</p>
            <p className="text-xl font-bold">{account.balance.toLocaleString()} {account.currency}</p>
          </div>
          <div className="flex items-center text-sm">
            <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">
              {account.loans && account.loans.length > 0 ? `${account.loans.length} prêt(s)` : 'Aucun prêt'}
            </span>
            {account.loans && account.loans.some(loan => loan.isLate) && (
              <Badge variant="destructive" className="ml-2">Échéance proche</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SfdAccountCard;
