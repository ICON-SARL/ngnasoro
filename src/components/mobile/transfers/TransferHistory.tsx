
import React from 'react';
import { useTransfer } from '@/hooks/useTransfer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowDown, ArrowUp, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TransferHistory() {
  const { transferHistory, isLoadingHistory, refetchHistory } = useTransfer();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Filtrer l'historique des transferts
  const filteredHistory = transferHistory.filter(transaction => 
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Raffraichir l'historique
  const handleRefresh = () => {
    refetchHistory();
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Historique des transferts</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un transfert..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingHistory ? (
          <div className="py-10 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p>Aucun transfert trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <ArrowUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">-{transaction.amount.toLocaleString()} FCFA</p>
                  <p className="text-xs uppercase text-gray-500">{transaction.payment_method}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
