
import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount } from '@/hooks/useAccount';
import { Button } from '@/components/ui/button';

interface BalanceSectionProps {
  currency?: string;
  onAction?: (action: string, data?: any) => void;
}

const BalanceSection = ({ 
  currency = "FCFA", 
  onAction
}: BalanceSectionProps) => {
  const navigate = useNavigate();
  const { account, isLoading } = useAccount();
  
  // Payment information
  const nextPaymentDate = "15/07/2023";
  const nextPaymentAmount = 25000;
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  const currentTime = new Date();
  const formattedTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col">
      <Card className="p-4 bg-white border-none rounded-lg shadow-sm mt-4">
        <CardContent className="p-0">
          <div className="flex justify-between mb-2">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="14" x="3" y="5" rx="2" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M3 10h18" />
              </svg>
              Solde disponible
            </div>
            <div className="flex items-center text-orange-500">
              <Calendar className="w-5 h-5 mr-1" />
              Prochain paiement
            </div>
          </div>
          
          <div className="flex justify-between mb-3">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {formatCurrency(account?.balance || 0)} {currency}
              </h2>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-500">
                {formatCurrency(nextPaymentAmount)} {currency}
              </h2>
              <div className="flex items-center justify-end text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
                </svg>
                0j 0h 0m 0s
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              Mis à jour: {formattedTime}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 p-0 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSection;
