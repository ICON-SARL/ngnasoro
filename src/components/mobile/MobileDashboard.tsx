
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import FinancialSnapshot from './financial-snapshot/FinancialSnapshot';

interface MobileDashboardProps {
  onTitleChange?: (title: string) => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ onTitleChange }) => {
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (onTitleChange) {
      onTitleChange('Tableau de bord');
    }
  }, [onTitleChange]);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-[#0D6A51] text-white p-4 -mx-4 -mt-4 mb-4">
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
        <p className="text-sm opacity-80">Bienvenue, {user?.email?.split('@')[0] || 'utilisateur'}</p>
      </div>

      <FinancialSnapshot />
      
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-medium mb-2">Accès rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-700">Mes prêts</h3>
            <p className="text-sm text-gray-600">Voir vos prêts actifs</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="font-medium text-green-700">Épargne</h3>
            <p className="text-sm text-gray-600">Gérer votre épargne</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
