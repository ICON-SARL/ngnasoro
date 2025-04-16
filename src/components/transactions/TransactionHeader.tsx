
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Calendar, Download } from 'lucide-react';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { Transaction } from '@/types/transactions';

interface TransactionHeaderProps {
  totalAmount: number;
  onRefresh?: () => void;
  onFilter?: () => void;
  onDateFilter?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  currency?: string;
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  totalAmount,
  onRefresh,
  onFilter,
  onDateFilter,
  onExport,
  isRefreshing = false,
  currency = 'FCFA'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Solde total</h2>
          <p className="text-2xl font-bold text-[#0D6A51] mt-1">
            {formatCurrencyAmount(totalAmount)} {currency}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          )}
          
          {onFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFilter}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          )}
          
          {onDateFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDateFilter}
              className="flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Période
            </Button>
          )}
          
          {onExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        Dernière mise à jour: {new Date().toLocaleString()}
      </div>
    </div>
  );
};
