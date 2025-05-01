
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { User, CreditCard, RefreshCw } from 'lucide-react';

import ClientSavingsAccount from '@/components/sfd/ClientSavingsAccount';
import { BankAccountDialog } from './BankAccountDialog';
import { clientUserService } from '@/services/clientUserService';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface ClientBankAccountTabProps {
  client: any;
}

export const ClientBankAccountTab: React.FC<ClientBankAccountTabProps> = ({ client }) => {
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [clientCode, setClientCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSyncingAccounts, setIsSyncingAccounts] = useState(false);
  const [savingsAccountRefresh, setSavingsAccountRefresh] = useState(0);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();

  const hasUserAccount = !!client?.user_id;

  const createUserAccount = async () => {
    if (!client || !client.id) {
      toast({
        title: "Erreur",
        description: "Impossible de créer un compte utilisateur: client invalide",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAccount(true);
    try {
      const result = await clientUserService.createUserAccount(client.id);
      
      if (result && result.success) {
        toast({
          title: "Compte utilisateur créé",
          description: "Un nouveau compte utilisateur a été créé pour ce client."
        });
        
        // Try to sync accounts automatically
        try {
          await syncClientAccounts();
        } catch (syncError) {
          console.error("Error syncing accounts after user creation:", syncError);
        }
        
        // Force component refresh
        setSavingsAccountRefresh(prev => prev + 1);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de créer le compte utilisateur",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du compte",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const syncUserByClientCode = async () => {
    if (!clientCode) {
      toast({
        title: "Code client requis",
        description: "Veuillez entrer un code client valide",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await clientUserService.syncClientWithUserByCode(client.id, clientCode);
      
      if (result && result.success) {
        toast({
          title: "Synchronisation réussie",
          description: "Le client a été synchronisé avec le compte utilisateur."
        });
        
        // Try to sync accounts automatically
        try {
          await syncClientAccounts();
        } catch (syncError) {
          console.error("Error syncing accounts after user sync:", syncError);
        }
        
        // Close dialog and refresh component
        setIsSyncDialogOpen(false);
        setSavingsAccountRefresh(prev => prev + 1);
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: result.error || "Impossible de synchroniser le client avec le compte utilisateur",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la synchronisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncClientAccounts = async () => {
    if (!activeSfdId || !client?.user_id) {
      console.log("Cannot sync accounts: missing sfdId or userId");
      return;
    }

    setIsSyncingAccounts(true);
    try {
      const result = await clientUserService.syncClientAccounts(activeSfdId, client.id);
      
      if (result && result.success) {
        toast({
          title: "Comptes synchronisés",
          description: `${result.syncedCount || 0} comptes ont été synchronisés`
        });
        
        // Force component refresh
        setSavingsAccountRefresh(prev => prev + 1);
      }
    } catch (error: any) {
      console.error("Error syncing client accounts:", error);
    } finally {
      setIsSyncingAccounts(false);
    }
  };

  // Auto-sync accounts when component mounts if the client has a user_id
  useEffect(() => {
    if (client?.user_id && activeSfdId) {
      syncClientAccounts();
    }
  }, [client?.user_id, activeSfdId]);

  return (
    <div className="space-y-6">
      {hasUserAccount && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Compte utilisateur associé</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={syncClientAccounts}
            disabled={isSyncingAccounts}
            className="flex items-center"
          >
            {isSyncingAccounts ? <Loader size="sm" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Synchroniser les comptes
          </Button>
        </div>
      )}

      {!hasUserAccount && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium mb-2">Ce client ne dispose pas de compte utilisateur</h3>
              <p className="text-sm text-gray-500 mb-4">
                Pour créer un compte d'épargne, le client doit d'abord avoir un compte utilisateur dans l'application.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                  onClick={createUserAccount}
                  disabled={isCreatingAccount}
                >
                  {isCreatingAccount && <Loader size="sm" className="mr-2" />}
                  <User className="mr-2 h-4 w-4" />
                  Créer un compte utilisateur
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsSyncDialogOpen(true)}
                >
                  Synchroniser avec un compte existant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Savings Account Component */}
      <ClientSavingsAccount clientId={client?.id} clientName={client?.full_name} key={savingsAccountRefresh} />

      {/* Bank Account Creation Dialog */}
      <BankAccountDialog 
        isOpen={isBankDialogOpen} 
        onClose={() => setIsBankDialogOpen(false)} 
        clientId={client?.id}
        onSuccess={() => setSavingsAccountRefresh(prev => prev + 1)}
      />

      {/* Client Code Sync Dialog */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Synchroniser avec un compte existant</DialogTitle>
            <DialogDescription>
              Entrez le code client de l'utilisateur pour lier ce client à un compte existant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-code" className="text-right">
                Code client
              </Label>
              <div className="col-span-3">
                <Input
                  id="client-code"
                  placeholder="Ex: MEREF-SFD-XXXXXX-0000"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={syncUserByClientCode} disabled={isLoading}>
              {isLoading ? <Loader size="sm" className="mr-2" /> : null}
              Synchroniser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
