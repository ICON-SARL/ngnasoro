
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, Filter, Search, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import TransactionList from '../TransactionList';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const {
    transactions,
    isLoading,
    fetchTransactions
  } = useTransactions(user?.id, activeSfdId);
  
  useEffect(() => {
    fetchTransactions(50);
  }, [activeSfdId]);
  
  const handleViewDetails = (transactionId: string | number) => {
    navigate(`/mobile-flow/transactions/${transactionId}`);
  };
  
  const filteredTransactions = transactions.filter(tx => {
    // Filtrer par recherche
    const matchesSearch = !searchTerm || 
      (tx.name && tx.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par type
    const matchesType = filterType === 'all' || tx.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  const formatTransactionData = () => {
    return filteredTransactions.map(tx => ({
      id: tx.id,
      name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
      type: tx.type,
      amount: tx.type === 'deposit' || tx.type === 'loan_disbursement' 
        ? `+${formatCurrencyAmount(tx.amount)}` 
        : `-${formatCurrencyAmount(tx.amount)}`,
      date: new Date(tx.date || tx.created_at).toLocaleDateString(),
      avatar: tx.avatar_url
    }));
  };
  
  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Historique des transactions</h1>
        <Button variant="ghost" size="icon" onClick={() => fetchTransactions(50)}>
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une transaction"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="deposit">Dépôts</SelectItem>
              <SelectItem value="withdrawal">Retraits</SelectItem>
              <SelectItem value="loan_repayment">Remboursements</SelectItem>
              <SelectItem value="loan_disbursement">Décaissements</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex-shrink-0">
            <Calendar className="h-4 w-4 mr-2" />
            Date
          </Button>
        </div>
      </div>
      
      <div className="mb-20">
        <TransactionList 
          transactions={formatTransactionData()}
          isLoading={isLoading}
          title={`Transactions (${filteredTransactions.length})`}
          onViewAll={() => {}}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
