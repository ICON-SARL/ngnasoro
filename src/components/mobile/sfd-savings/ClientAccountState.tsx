
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, CreditCard } from 'lucide-react';

interface ClientAccountStateProps {
  client: SfdClient;
  balance: number;
  currency?: string;
  onManageAccount: () => void;
}

const ClientAccountState: React.FC<ClientAccountStateProps> = ({
  client,
  balance,
  currency = 'FCFA',
  onManageAccount
}) => {
  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="rounded-full bg-[#0D6A51]/10 p-2 mr-3">
              <CreditCard className="h-5 w-5 text-[#0D6A51]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Compte Épargne Client</h4>
              <p className="text-xs text-gray-500">{client.full_name}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onManageAccount}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="bg-[#F8F9FC] rounded-xl p-3 mb-2">
          <p className="text-xs text-[#0D6A51] mb-1">Solde disponible</p>
          <p className="text-xl font-semibold text-gray-900">
            {formatCurrencyAmount(balance)} {currency}
          </p>
        </div>
        
        <Button 
          onClick={onManageAccount} 
          variant="outline"
          className="w-full text-sm text-[#0D6A51] border-[#0D6A51]/30"
        >
          Gérer le compte
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientAccountState;
