
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useAuth } from '@/hooks/useAuth';

interface MainDashboardProps {
  onAction?: (action: string) => void;
  account?: any;
  transactions?: any[];
  transactionsLoading?: boolean;
  toggleMenu?: () => void;
}

const MobileDashboard: React.FC<MainDashboardProps> = ({
  onAction,
  account,
  transactions = [],
  transactionsLoading = false,
  toggleMenu
}) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <MobileHeader title="Tableau de Bord" />
      
      <div className="container p-4">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue sur l'application mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Cette application vous permet de gérer vos clients et crédits SFD.
            </p>
            
            {user ? (
              <div>
                <p>Connecté en tant que: {user.email}</p>
              </div>
            ) : (
              <p>Veuillez vous connecter pour accéder à toutes les fonctionnalités.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileDashboard;
