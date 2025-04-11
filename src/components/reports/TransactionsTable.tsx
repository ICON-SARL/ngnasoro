
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, isLoading }) => {
  // État pour la recherche et le tri
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  
  // Fonction pour gérer le tri des colonnes
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Fonction pour filtrer les transactions
  const filteredTransactions = React.useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return transactions.filter(tx => 
      (tx.name && tx.name.toLowerCase().includes(lowerCaseQuery)) ||
      (tx.description && tx.description.toLowerCase().includes(lowerCaseQuery)) ||
      (tx.type && tx.type.toLowerCase().includes(lowerCaseQuery))
    );
  }, [transactions, searchQuery]);
  
  // Fonction pour trier les transactions
  const sortedTransactions = React.useMemo(() => {
    if (!sortColumn) return filteredTransactions;
    
    return [...filteredTransactions].sort((a, b) => {
      // @ts-ignore
      const aValue = a[sortColumn];
      // @ts-ignore
      const bValue = b[sortColumn];
      
      if (aValue === bValue) return 0;
      
      const compareResult = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [filteredTransactions, sortColumn, sortDirection]);
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };
  
  // Fonction pour formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };
  
  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-amber-600';
      case 'failed': return 'text-red-600';
      default: return '';
    }
  };
  
  // Fonction pour obtenir la classe CSS du type
  const getTypeClass = (type: string) => {
    switch(type) {
      case 'deposit':
      case 'loan_disbursement':
      case 'transfer_in':
        return 'text-green-600';
      case 'withdrawal':
      case 'loan_repayment':
      case 'transfer_out':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };
  
  // Fonction pour traduire le type de transaction
  const translateType = (type: string) => {
    const typeMap: Record<string, string> = {
      'deposit': 'Dépôt',
      'withdrawal': 'Retrait',
      'transfer_in': 'Transfert entrant',
      'transfer_out': 'Transfert sortant',
      'loan_disbursement': 'Décaissement de prêt',
      'loan_repayment': 'Remboursement de prêt'
    };
    
    return typeMap[type] || type;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="border rounded-md">
          <div className="h-10 bg-muted/50" />
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center p-4 border-t">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          {sortedTransactions.length} résultats
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button 
                  variant="ghost" 
                  className="-ml-4 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort('date')}
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="-ml-4 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort('type')}
                >
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  className="-ml-4 h-8 data-[state=open]:bg-accent"
                  onClick={() => handleSort('amount')}
                >
                  Montant
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.created_at)}
                  </TableCell>
                  <TableCell>
                    {transaction.name || transaction.description || 'N/A'}
                  </TableCell>
                  <TableCell className={getTypeClass(transaction.type)}>
                    {translateType(transaction.type)}
                  </TableCell>
                  <TableCell className={`text-right ${getTypeClass(transaction.type)}`}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className={`text-right ${getStatusClass(transaction.status || 'success')}`}>
                    {transaction.status || 'Succès'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Aucune transaction trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
