
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useCompatSfdAccounts } from '@/hooks/useCompatSfdAccounts';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export const AccountBalance: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { sfdAccounts, synchronizeBalances } = useSfdAccounts();
  // Use the compatibility hook to ensure we get activeSfdAccount
  const { activeSfdAccount } = useCompatSfdAccounts();
  
  const balance = activeSfdAccount?.balance || 0;
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Fixed: properly call the mutate function on synchronizeBalances
      await synchronizeBalances.mutateAsync();
      toast({
        title: "Compte mis à jour",
        description: "Le solde de votre compte a été actualisé",
      });
    } catch (error) {
      console.error("Failed to refresh balance:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le solde",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-gray-500 font-medium">Solde disponible</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-6 w-6"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {sfdAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-3">
              <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
              <p className="text-sm text-gray-600">Vous n'avez pas encore de compte SFD</p>
            </div>
          ) : (
            <div className="mt-1">
              {sfdAccounts.length === 0 || isRefreshing ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <h2 className="text-2xl font-bold">{formatCurrency(balance)}</h2>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Dernière mise à jour: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalance; // Added default export
