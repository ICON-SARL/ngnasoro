
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { Transaction } from '@/types/transactions';
import { Button } from '@/components/ui/button';
import { formatTransactionAmount, formatCurrencyAmount, safeIdToString } from '@/utils/transactionUtils';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Clock, 
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Tag,
  Hash
} from 'lucide-react';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
  transaction, 
  open, 
  onClose 
}) => {
  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = () => {
    const { status } = transaction;
    
    const badgeConfig = {
      success: { variant: "bg-green-100 text-green-800 border-green-200", label: "Réussi", icon: <Check className="h-3.5 w-3.5 mr-1.5" /> },
      pending: { variant: "bg-amber-100 text-amber-800 border-amber-200", label: "En attente", icon: <Clock className="h-3.5 w-3.5 mr-1.5" /> },
      failed: { variant: "bg-red-100 text-red-800 border-red-200", label: "Échoué", icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> },
      flagged: { variant: "bg-red-100 text-red-800 border-red-200", label: "Signalé", icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> }
    };
    
    const config = badgeConfig[status as keyof typeof badgeConfig] || badgeConfig.success;
    
    return (
      <Badge variant="outline" className={`${config.variant} flex items-center px-2 py-1 text-sm`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>Détails de la transaction</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <h3 className="text-sm text-gray-500 mb-1">Montant</h3>
            <div className={`text-2xl font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-gray-800'}`}>
              {formatTransactionAmount(transaction.amount, transaction.type)}
            </div>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {transaction.type.replace('_', ' ')}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Nom</span>
              </div>
              <span className="font-medium">{transaction.name}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Date</span>
              </div>
              <span className="font-medium">{formatDate(transaction.date || transaction.created_at || '')}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Type</span>
              </div>
              <span className="font-medium capitalize">{transaction.type.replace('_', ' ')}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Référence</span>
              </div>
              <span className="font-medium">{transaction.reference_id || safeIdToString(transaction.id).substring(0, 8)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Statut</span>
              </div>
              {getStatusBadge()}
            </div>
          </div>
          
          {transaction.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-600">{transaction.description}</p>
            </div>
          )}
        </div>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Fermer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
