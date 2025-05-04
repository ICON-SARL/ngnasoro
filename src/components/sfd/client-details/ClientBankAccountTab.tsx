
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

interface ClientBankAccountTabProps {
  client: any;
}

export const ClientBankAccountTab: React.FC<ClientBankAccountTabProps> = ({ client }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();

  useEffect(() => {
    // Check if client has a user_id but no savings account
    if (client?.user_id) {
      checkSavingsAccount();
    }
  }, [client]);

  const checkSavingsAccount = async () => {
    if (!client?.user_id) return;

    try {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();

      // No action needed if account exists
      if (data) return;

      // Auto-create savings account for clients with user_id
      handleEnsureSavingsAccount();
    } catch (error) {
      console.error('Error checking savings account:', error);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <ClientSavingsAccount 
          clientId={client.id} 
          clientName={client.full_name || 'Client'} 
        />
      </div>
      
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
