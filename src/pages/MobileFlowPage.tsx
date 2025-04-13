
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import ClientLoanStatus from '@/components/ClientLoanStatus';
import MobileProfilePage from '@/components/mobile/MobileProfilePage';

const MobileFlowPage = () => {
  const { user } = useAuth();
  const { sfdData, isLoading } = useSfdDataAccess();
  const [title, setTitle] = useState('Tableau de bord');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/mobile-flow/main" replace />} />
          <Route 
            path="/main" 
            element={<MobileDashboard onTitleChange={(newTitle) => setTitle(newTitle)} />} 
          />
          <Route 
            path="/my-loans" 
            element={
              <div>
                <ClientLoanStatus />
              </div>
            }
          />
          <Route 
            path="/loans" 
            element={
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Demandes de prêts</h2>
                <p>Fonctionnalité en développement</p>
              </div>
            }
          />
          <Route 
            path="/savings" 
            element={
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Mes fonds</h2>
                <p>Fonctionnalité en développement</p>
              </div>
            }
          />
          <Route 
            path="/profile/*" 
            element={<MobileProfilePage />}
          />
        </Routes>
      </main>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileFlowPage;
