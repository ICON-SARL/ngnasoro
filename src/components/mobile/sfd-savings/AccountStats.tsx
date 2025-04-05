
import React from 'react';

interface AccountStatsProps {
  isHidden: boolean;
  balance: number;
}

const AccountStats: React.FC<AccountStatsProps> = ({ isHidden, balance }) => {
  // Calculate a fake growth percentage based on the balance
  const growthPercent = ((balance % 17) + 2) / 100;
  const growth = balance * growthPercent;
  
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 mr-2">
        <p className="text-xs text-gray-500 mb-1">Croissance</p>
        {isHidden ? (
          <p className="font-medium">••••••</p>
        ) : (
          <p className="font-medium text-green-600">+{growth.toLocaleString('fr-FR')} FCFA</p>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
        <p className="text-xs text-gray-500 mb-1">Taux d'intérêt</p>
        <p className="font-medium">3.8% annuel</p>
      </div>
    </div>
  );
};

export default AccountStats;
