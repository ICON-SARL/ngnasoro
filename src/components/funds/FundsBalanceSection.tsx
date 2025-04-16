
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FundsBalanceSectionProps {
  balance: number;
  isRefreshing: boolean;
}

const FundsBalanceSection = ({ balance, isRefreshing }: FundsBalanceSectionProps) => {
  return (
    <Card className="mx-4 -mt-8 bg-white shadow-lg relative z-10">
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">Solde disponible</p>
          {isRefreshing ? (
            <Skeleton className="h-8 w-40 mx-auto" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {balance.toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundsBalanceSection;
