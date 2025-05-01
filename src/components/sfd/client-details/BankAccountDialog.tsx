
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BankAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess?: () => void;
}

export function BankAccountDialog({ isOpen, onClose, clientId, onSuccess }: BankAccountDialogProps) {
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { createAccount, isLoading } = useSavingsAccount(clientId);
  const { activeSfdId } = useAuth();

  useEffect(() => {
    if (isOpen && clientId) {
      setLoading(true);
      fetchClientDetails();
    }
  }, [isOpen, clientId]);

  const fetchClientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSfdId) {
      console.error("Aucune SFD active n'a été trouvée");
      return;
    }

    if (!client?.user_id) {
      console.error("Le client n'a pas de compte utilisateur associé");
      return;
    }

    try {
      await createAccount.mutateAsync({ 
        initialBalance,
        userId: client.user_id
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating savings account:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un compte d'épargne</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center p-6">
            <Loader size="md" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initial-balance" className="text-right">
                  Solde initial
                </Label>
                <div className="col-span-3">
                  <Input
                    id="initial-balance"
                    type="number"
                    min="0"
                    step="1000"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !client?.user_id}
                title={!client?.user_id ? "Le client n'a pas de compte utilisateur" : ""}
              >
                {isLoading ? <Loader size="sm" className="mr-2" /> : null}
                Créer le compte
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
