
import React, { useState } from 'react';
import { useClientAccountOperations } from '@/hooks/useClientAccountOperations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpDown, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';

interface ClientAccountDetailsProps {
  clientId: string;
  clientName: string;
}

const ClientAccountDetails: React.FC<ClientAccountDetailsProps> = ({ 
  clientId, 
  clientName
}) => {
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const { balance, currency, isLoading, refetchBalance } = useClientAccountOperations(clientId);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Compte client
        </CardTitle>
        <CardDescription>
          Gestion du compte de {clientName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md bg-[#F8F9FC] p-4">
            <div className="mb-2 text-sm font-medium">Solde actuel</div>
            <div className="text-2xl font-semibold text-[#0D6A51]">
              {balance?.toLocaleString('fr-FR')} {currency}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Dernière mise à jour: {format(new Date(), 'PPP', { locale: fr })}
            </div>
          </div>

          <Button 
            onClick={() => setIsOperationDialogOpen(true)}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Crédit / Débit
          </Button>

          <AccountOperationDialog 
            isOpen={isOperationDialogOpen}
            onClose={() => setIsOperationDialogOpen(false)}
            clientId={clientId}
            clientName={clientName}
            onOperationComplete={refetchBalance}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientAccountDetails;
