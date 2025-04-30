
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, RefreshCw } from 'lucide-react';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { BankAccountDialog } from './BankAccountDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientBankAccountTabProps {
  client: any;
}

export function ClientBankAccountTab({ client }: ClientBankAccountTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    account, 
    isLoading,
    refetch
  } = useSavingsAccount(client?.id);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Comptes bancaires</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter un compte
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader size="md" />
        </div>
      ) : account ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Compte d'épargne</h4>
                <p className="text-sm text-gray-500">
                  {account.id ? account.id.substring(0, 8) : 'Compte bancaire'} - {client?.full_name}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="font-medium">{account.balance?.toLocaleString('fr-FR')} {account.currency || 'FCFA'}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Mis à jour le {format(new Date(account.last_updated || account.updated_at || Date.now()), 'Pp', { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100 p-3">
                <Wallet className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 mb-4">Aucun compte bancaire enregistré</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Créer un compte d'épargne
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BankAccountDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        clientId={client?.id}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
