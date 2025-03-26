
import React from 'react';
import { Building, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount } from '@/hooks/useAccount';

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

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-white/80 uppercase tracking-wide mb-1">
            SOLDE DISPONIBLE <span>↗</span>
          </p>
          <h1 className="text-4xl font-bold text-white mb-2">
            {currency} {formatCurrency(account?.balance || 0)}
          </h1>
          <Badge className="bg-[#FFAB2E]/90 text-white border-none">
            Compte actif
          </Badge>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center">
          <Building className="h-4 w-4 mr-1.5 text-white" />
          <span className="text-sm text-white">SFD Primaire</span>
        </div>
      </div>
      
      <Card className="p-3 bg-white/10 backdrop-blur-sm rounded-xl mt-4 mb-4 border-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-white" />
              <p className="text-white text-sm">Prochain remboursement</p>
            </div>
            <Badge className="bg-red-500/80 text-white border-none">
              {nextPaymentDate}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white text-sm">Montant dû:</p>
            <p className="text-white font-bold">{currency} {formatCurrency(nextPaymentAmount)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSection;
