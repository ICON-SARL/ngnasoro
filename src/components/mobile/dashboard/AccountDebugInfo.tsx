
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { RefreshCw, Bug, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';

export const AccountDebugInfo: React.FC = () => {
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const { sfdAccounts, synchronizeBalances, refetch } = useSfdAccounts();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  const handleSyncBalances = async () => {
    setIsRefreshing(true);
    try {
      await synchronizeBalances.mutate();
      toast({
        title: "Synchronisation réussie",
        description: "Les soldes ont été mis à jour avec succès",
      });
      await refetch();
    } catch (error) {
      console.error("Error syncing balances:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la synchronisation",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkAccountsTable = async () => {
    if (!user?.id) return;
    
    setIsChecking(true);
    try {
      // Query the accounts table directly
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error checking accounts table:', error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier la table des comptes",
          variant: "destructive",
        });
        return;
      }
      
      setAccountInfo(data);
      
      toast({
        title: "Vérification terminée",
        description: `${data?.length || 0} compte(s) trouvé(s) dans la base de données`,
      });
    } catch (err) {
      console.error("Error checking accounts table:", err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Bug className="w-4 h-4 mr-2" /> 
          Informations de débogage des comptes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-semibold mb-2">Comptes récupérés par le hook:</p>
          {sfdAccounts.length === 0 ? (
            <p className="text-amber-500">Aucun compte trouvé</p>
          ) : (
            <ul className="space-y-2">
              {sfdAccounts.map(account => (
                <li key={account.id} className="border p-2 rounded-md">
                  <div>ID: {account.id}</div>
                  <div>SFD ID: {account.sfd_id}</div>
                  <div>Type: {account.account_type}</div>
                  <div className="font-semibold">Solde: {formatCurrency(account.balance)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm"
            onClick={handleSyncBalances}
            disabled={isRefreshing}
            className="flex items-center"
          >
            {isRefreshing ? (
              <Loader size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Synchroniser les soldes
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkAccountsTable}
            disabled={isChecking}
            className="flex items-center"
          >
            {isChecking ? (
              <Loader size="sm" className="mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Vérifier la table
          </Button>
        </div>

        {accountInfo && (
          <div className="mt-2 p-2 bg-gray-100 rounded-md">
            <p className="font-semibold mb-1">Données brutes de la table accounts:</p>
            <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-800 text-white rounded-md">
              {JSON.stringify(accountInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDebugInfo;
