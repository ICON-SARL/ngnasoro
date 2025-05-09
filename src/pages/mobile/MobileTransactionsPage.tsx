
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, Filter, Search, Calendar } from 'lucide-react';
import { useTransactions, Transaction as HookTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { TransactionsList } from '@/components/transactions/TransactionsList';

const MobileTransactionsPage = () => {
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
    fetchTransactions();
  }, [activeSfdId, fetchTransactions]);

  const handleRefresh = () => {
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(tx => {
    // Filter by search term
    const matchesSearch = !searchTerm || 
      (tx.name && tx.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by type
    const matchesType = filterType === 'all' || tx.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Transactions</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className="ml-auto"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 py-4 space-y-4">
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
      
      <div className="px-4">
        <TransactionsList
          transactions={filteredTransactions as any} // Type casting to avoid the mismatch
          isLoading={isLoading}
          title={`Transactions (${filteredTransactions.length})`}
          showSearch={false}
        />
      </div>
    </div>
  );
};

export default MobileTransactionsPage;
