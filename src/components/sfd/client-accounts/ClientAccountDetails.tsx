
import React, { useState } from 'react';
import { useClientAccountOperations } from '@/hooks/useClientAccountOperations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpDown, History, TrendingUp, CreditCard, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface ClientAccountDetailsProps {
  clientId: string;
  clientName: string;
}

const ClientAccountDetails: React.FC<ClientAccountDetailsProps> = ({ 
  clientId, 
  clientName
}) => {
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [operationType, setOperationType] = useState<'credit' | 'debit'>('credit');
  const { balance, currency, isLoading, refetchBalance } = useClientAccountOperations(clientId);

  const handleOpenOperationDialog = (type: 'credit' | 'debit') => {
    setOperationType(type);
    setIsOperationDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="pb-2 bg-gray-50">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
            Compte client
          </CardTitle>
          <CardDescription>
            Gestion du compte de {clientName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="rounded-md bg-[#F8F9FC] p-4 border border-[#E5E7EB]">
              <div className="mb-2 text-sm font-medium text-gray-500">Solde actuel</div>
              <div className="flex items-center">
                <div className="text-2xl font-semibold text-[#0D6A51] mr-2">
                  {isLoading ? (
                    <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
                  ) : (
                    <>{balance?.toLocaleString('fr-FR')} {currency}</>
                  )}
                </div>
                {!isLoading && balance > 0 && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <History className="h-3 w-3 mr-1" />
                Dernière mise à jour: {format(new Date(), 'PPP', { locale: fr })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => handleOpenOperationDialog('credit')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      variant="default"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crédit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ajouter des fonds au compte client</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => handleOpenOperationDialog('debit')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      variant="default"
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Débit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Retirer des fonds du compte client</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>

        <AccountOperationDialog 
          isOpen={isOperationDialogOpen}
          onClose={() => setIsOperationDialogOpen(false)}
          clientId={clientId}
          clientName={clientName}
          onOperationComplete={refetchBalance}
          defaultType={operationType}
        />
      </Card>
    </motion.div>
  );
};

export default ClientAccountDetails;
