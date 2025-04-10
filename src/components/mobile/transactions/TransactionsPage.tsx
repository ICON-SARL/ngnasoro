
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Search, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionsPageProps {
  transactions: any[];
  isLoading: boolean;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, isLoading }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const filteredTransactions = transactions.filter(transaction => {
    // Apply search filter
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply type filter
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'deposit' && transaction.type === 'deposit') ||
      (filter === 'withdrawal' && transaction.type === 'withdrawal');
      
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-20 font-montserrat">
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-[#0D6A51] mb-4">Historique des transactions</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout</SelectItem>
              <SelectItem value="deposit">Dépôts</SelectItem>
              <SelectItem value="withdrawal">Retraits</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-[#0D6A51] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune transaction trouvée</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {transaction.type === 'deposit' ? (
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} FCFA
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
