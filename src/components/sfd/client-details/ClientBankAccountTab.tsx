
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BankAccountDialog } from './BankAccountDialog';
import ClientSavingsAccount from '@/components/sfd/ClientSavingsAccount';
import ClientTransactionHistory from './ClientTransactionHistory';
import { useToast } from '@/hooks/use-toast';
import { savingsAccountService } from '@/services/savings/savingsAccountService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PiggyBank, RefreshCw } from 'lucide-react';

interface ClientBankAccountTabProps {
  client: any;
}

export const ClientBankAccountTab: React.FC<ClientBankAccountTabProps> = ({ client }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [clientAccount, setClientAccount] = useState<any>(null);

  useEffect(() => {
    if (client?.user_id) {
      fetchClientAccount();
    }
  }, [client]);

  const fetchClientAccount = async () => {
    if (!client?.user_id) return;

    setIsRefreshing(true);
    try {
      // Directement chercher le compte par user_id 
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Prendre le premier compte si plusieurs sont trouvés
        setClientAccount(data[0]);
      } else {
        setClientAccount(null);
      }
    } catch (error) {
      console.error('Error fetching client account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations du compte",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEnsureSavingsAccount = async () => {
    if (!client?.id || !activeSfdId) return;
    
    setIsLoading(true);
    try {
      // First try to ensure the client has a user_id
      // If not, we'll look up or create one
      const success = await savingsAccountService.ensureClientSavingsAccount(client.id, activeSfdId);
      
      if (success) {
        toast({
          title: "Compte créé avec succès",
          description: "Le compte d'épargne a été créé pour le client"
        });
        
        // Refresh to show the new account
        await fetchClientAccount();
      } else {
        throw new Error("Erreur lors de la création du compte épargne");
      }
    } catch (error) {
      console.error("Error ensuring savings account:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer un compte épargne pour ce client",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleRefresh = async () => {
    await fetchClientAccount();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Si on a client.user_id, afficher le composant ClientSavingsAccount */}
        {client?.user_id ? (
          <ClientSavingsAccount 
            clientId={client.id} 
            clientName={client.full_name || 'Client'}
            key={`savings-account-${client.id}-${isRefreshing}`} 
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Compte d'épargne</CardTitle>
              <CardDescription>
                Le client n'a pas encore de compte utilisateur associé
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Un compte utilisateur est nécessaire pour créer un compte d'épargne</p>
              <Button
                onClick={handleEnsureSavingsAccount}
                disabled={isLoading}
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <PiggyBank className="mr-2 h-4 w-4" />
                {isLoading ? 'Création en cours...' : 'Créer un compte utilisateur et d\'épargne'}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Bouton de rafraîchissement */}
        {client?.user_id && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
          </div>
        )}
      </div>
      
      {/* Historique des transactions */}
      <ClientTransactionHistory clientId={client.id} />
      
      <BankAccountDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        clientId={client.id}
      />
    </div>
  );
};

export default ClientBankAccountTab;
