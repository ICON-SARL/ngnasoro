
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeBalance } from '@/hooks/useRealtimeBalance';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { formatCurrency } from '@/utils/formatters';
import { RefreshCw, Signal } from 'lucide-react';

export function SfdLoanPageBalance() {
  const { operationAccount } = useSfdAccounts();
  const initialBalance = operationAccount?.balance || 0;
  
  const { balance, lastUpdated, isLive } = useRealtimeBalance(
    initialBalance, 
    operationAccount?.id
  );

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Solde disponible pour les prêts</span>
          {isLive && <Signal className="h-4 w-4 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <div className="text-sm text-muted-foreground">
              Compte opérationnel
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 mr-1" />
              Mise à jour {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
