
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClientAccountOperations } from '@/components/admin/hooks/sfd-client/useClientAccountOperations';
import { Loader } from '@/components/ui/loader';
import { CreditCard, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';

interface ClientAccountDetailsProps {
  clientId: string;
  clientName: string;
  phone?: string;
}

const ClientAccountDetails: React.FC<ClientAccountDetailsProps> = ({ 
  clientId, 
  clientName,
  phone
}) => {
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const { balance, currency, isLoading, refetchBalance } = useClientAccountOperations(clientId);

  const handleOperationComplete = () => {
    refetchBalance();
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Compte client {phone && <span className="text-sm ml-2 text-gray-500">({phone})</span>}
        </CardTitle>
        <CardDescription>
          Gestion du compte et des opérations pour {clientName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader size="md" />
          </div>
        ) : (
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
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setIsOperationDialogOpen(true)}
                className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Crédit / Débit
              </Button>
            </div>
            
            <AccountOperationDialog
              isOpen={isOperationDialogOpen}
              onClose={() => setIsOperationDialogOpen(false)}
              clientId={clientId}
              clientName={clientName}
              onOperationComplete={handleOperationComplete}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientAccountDetails;
