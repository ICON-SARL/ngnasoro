
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ClientBankAccountTabProps {
  client: any;
}

export function ClientBankAccountTab({ client }: ClientBankAccountTabProps) {
  // Here we would typically fetch bank account data for the client
  const accounts = client.accounts || [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Comptes bancaires</h3>
        <Button variant="outline" size="sm" className="flex items-center">
          <Plus className="h-4 w-4 mr-1" /> Ajouter un compte
        </Button>
      </div>
      
      {accounts.length > 0 ? (
        <div className="grid gap-4">
          {accounts.map((account: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{account.account_number || 'Compte sans numéro'}</h4>
                    <p className="text-sm text-gray-500">{account.bank_name || 'Banque non spécifiée'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{account.balance ? `${account.balance} CFA` : 'Solde non disponible'}</p>
                    <p className="text-xs text-gray-500">{account.status || 'Actif'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-gray-500">Aucun compte bancaire enregistré</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
