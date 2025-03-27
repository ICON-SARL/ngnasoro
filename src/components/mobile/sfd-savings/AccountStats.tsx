
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface AccountStatsProps {
  isHidden: boolean;
  balance: number | undefined;
}

const AccountStats: React.FC<AccountStatsProps> = ({ isHidden, balance = 125000 }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-green-50 p-3 rounded-xl">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-gray-600">Dépôts</p>
          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          </div>
        </div>
        <p className="text-xl font-semibold text-gray-800">
          {isHidden ? '•••••' : `+${Math.floor(balance / 2).toLocaleString()} FCFA`}
        </p>
        <p className="text-xs text-gray-500 mt-1">Derniers 3 mois</p>
      </div>
      
      <div className="bg-amber-50 p-3 rounded-xl">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-gray-600">Intérêts</p>
          <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
            <ArrowUpRight className="h-3 w-3 text-amber-600" />
          </div>
        </div>
        <p className="text-xl font-semibold text-gray-800">
          {isHidden ? '•••••' : `+${Math.floor(balance * 0.03).toLocaleString()} FCFA`}
        </p>
        <p className="text-xs text-gray-500 mt-1">Taux 3% annuel</p>
      </div>
    </div>
  );
};

export default AccountStats;
