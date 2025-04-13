
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Account } from '@/types/transactions';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface SFDSavingsOverviewProps {
  account: Account | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SFDSavingsOverview: React.FC<SFDSavingsOverviewProps> = ({ 
  account,
  onRefresh,
  isRefreshing = false 
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("SFDSavingsOverview mounted with account:", account);
  }, [account]);
  
  const handleNavigateToFunds = () => {
    navigate('/mobile-flow/savings');
  };
  
  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Solde disponible</h3>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        
        <div className="flex justify-center items-center my-6">
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrencyAmount(account?.balance || 0)} {account?.currency || 'FCFA'}
          </p>
        </div>
        
        <div className="flex justify-center space-x-3 mt-6">
          <Button 
            className="rounded-full py-2 px-5 flex items-center bg-[#0D6A51]/10 hover:bg-[#0D6A51]/20 text-[#0D6A51] transition-colors shadow-sm"
            onClick={handleNavigateToFunds}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Gérer mes fonds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
