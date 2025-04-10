
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TransactionsPageProps {
  transactions: any[];
  isLoading: boolean;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ 
  transactions,
  isLoading 
}) => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0D6A51] to-[#064335] p-4 text-white">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Historique de transactions</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Rechercher une transaction" 
            className="bg-white/10 border-none placeholder:text-white/60 text-white pl-10"
          />
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0D6A51]"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-1">
            {transactions.map((transaction, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    } flex items-center justify-center mr-3`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowDown className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUp className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <p className="font-medium">
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {Math.abs(transaction.amount).toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune transaction à afficher</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
