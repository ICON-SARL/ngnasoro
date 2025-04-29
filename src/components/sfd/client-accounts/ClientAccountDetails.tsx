
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowDownUp, Plus, Minus, RefreshCcw, Clock } from 'lucide-react';
import { useClientAccountOperations } from '@/hooks/useClientAccountOperations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientAccountDetailsProps {
  clientId: string;
  clientName: string;
}

const ClientAccountDetails: React.FC<ClientAccountDetailsProps> = ({ clientId, clientName }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [operationType, setOperationType] = useState<'credit' | 'debit'>('credit');

  const {
    balance,
    currency,
    isLoading,
    transactions,
    isLoadingTransactions,
    creditAccount,
    refetchBalance
  } = useClientAccountOperations(clientId);

  const handleOperation = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    const amountValue = Number(amount);
    if (amountValue <= 0) return;
    
    // Pour un débit, nous passons un montant négatif
    const finalAmount = operationType === 'credit' ? amountValue : -amountValue;
    
    try {
      await creditAccount.mutateAsync({
        amount: finalAmount,
        description: description || (operationType === 'credit' ? `Crédit manuel` : `Débit manuel`)
      });
      
      // Réinitialisation des champs après opération réussie
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Erreur lors de l\'opération:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'FCFA',
      currencyDisplay: 'symbol',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTransactionTypeIcon = (type: string) => {
    if (type === 'deposit') return <Plus className="h-4 w-4 text-green-500" />;
    if (type === 'withdrawal') return <Minus className="h-4 w-4 text-red-500" />;
    return <ArrowDownUp className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Solde du compte</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{formatCurrency(balance)}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refetchBalance}
                  className="text-gray-500"
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Actualiser
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Compte de {clientName}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Opération sur le compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                variant={operationType === 'credit' ? 'default' : 'outline'}
                onClick={() => setOperationType('credit')}
                className={operationType === 'credit' ? 'bg-green-600 hover:bg-green-700' : ''}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Crédit
              </Button>
              <Button
                variant={operationType === 'debit' ? 'default' : 'outline'}
                onClick={() => setOperationType('debit')}
                className={operationType === 'debit' ? 'bg-red-600 hover:bg-red-700' : ''}
                size="sm"
              >
                <Minus className="h-4 w-4 mr-1" />
                Débit
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1 block">
                  Montant
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Entrez un montant"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mb-2"
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1 block">
                  Description (optionnel)
                </label>
                <Input
                  id="description"
                  placeholder="Description de l'opération"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button
              className={operationType === 'credit' ? 'bg-green-600 hover:bg-green-700 w-full' : 'bg-red-600 hover:bg-red-700 w-full'}
              onClick={handleOperation}
              disabled={!amount || isNaN(Number(amount)) || creditAccount.isPending}
            >
              {creditAccount.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {operationType === 'credit' ? 'Créditer le compte' : 'Débiter le compte'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Aucune transaction récente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getTransactionTypeIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium">{tx.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(tx.created_at), 'PPp', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAccountDetails;
