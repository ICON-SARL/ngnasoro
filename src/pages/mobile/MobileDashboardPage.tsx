
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const MobileDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => handleNavigation('/mobile-flow/loans')}>
          <h2 className="font-semibold text-lg">Prêts</h2>
          <p className="text-gray-600">Gérer vos prêts et demandes</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation('/mobile-flow/transactions')}>
          <h2 className="font-semibold text-lg">Transactions</h2>
          <p className="text-gray-600">Historique des transactions</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation('/mobile-flow/funds-management')}>
          <h2 className="font-semibold text-lg">Gestion de fonds</h2>
          <p className="text-gray-600">Dépôts et retraits</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation('/mobile-flow/profile')}>
          <h2 className="font-semibold text-lg">Profil</h2>
          <p className="text-gray-600">Gérer votre profil</p>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleNavigation('/mobile-flow/loan-application')}>
          Nouvelle demande de prêt
        </Button>
      </div>
    </div>
  );
};

export default MobileDashboardPage;
