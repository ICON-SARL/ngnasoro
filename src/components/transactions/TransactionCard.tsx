import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowDown, ArrowUp, Check, Clock, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { formatTransactionAmount } from '@/utils/transactionUtils';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onClick 
}) => {
  const { type, amount, name, date, status, avatar_url } = transaction;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getTransactionIcon = () => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUp className="h-4 w-4 text-gray-700" />;
      case 'transfer':
        return amount > 0 
          ? <ArrowDown className="h-4 w-4 text-green-600" /> 
          : <ArrowUp className="h-4 w-4 text-gray-700" />;
      case 'payment':
        return <Wallet className="h-4 w-4 text-blue-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-amber-600" />;
      case 'failed':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'flagged':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (!status || status === 'success') return null;
    
    const badgeVariants = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      flagged: "bg-red-100 text-red-800 border-red-200"
    };
    
    const badgeLabels = {
      pending: "En attente",
      failed: "Échoué",
      flagged: "Signalé"
    };
    
    const variant = badgeVariants[status as keyof typeof badgeVariants];
    const label = badgeLabels[status as keyof typeof badgeLabels];
    
    if (!variant || !label) return null;
    
    return (
      <Badge variant="outline" className={`text-xs ${variant} ml-2 flex items-center`}>
        {getStatusIcon()}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  return (
    <Card 
      className="border-0 shadow-sm mb-2 hover:shadow-md transition-shadow"
      onClick={() => onClick && onClick(transaction)}
    >
      <CardContent className="p-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 bg-lime-100">
            {avatar_url ? (
              <img src={avatar_url} alt={name} />
            ) : (
              <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center">
                {getTransactionIcon()}
              </div>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="flex items-center">
                <p className="font-medium text-sm">{name}</p>
                {getStatusBadge()}
              </div>
              <p className={`font-semibold text-sm ${amount >= 0 ? 'text-green-600' : 'text-gray-800'}`}>
                {formatTransactionAmount(amount)}
              </p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">{formatDate(date || transaction.created_at || '')}</p>
              <p className="text-xs text-gray-500 capitalize">{type.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
