
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import WelcomeScreen from '@/components/mobile/WelcomeScreen';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import MobileProfilePage from '@/components/mobile/MobileProfilePage';
import FundsPage from '@/components/mobile/funds/FundsPage';
import MobileMyLoansPageContainer from './mobile/MobileMyLoansPage';
import SfdsListPage from './mobile/SfdsListPage';
import SfdDetailPage from './mobile/SfdDetailPage';

const MobileFlowPage = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('Tableau de bord');

  const handleStart = () => {
    // Save that the user has seen the welcome screen
    localStorage.setItem('hasVisitedApp', 'true');
  };

  // Check if the user has visited the app before
  const hasVisited = localStorage.getItem('hasVisitedApp');

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/mobile-flow/main" replace />} />
          <Route path="/welcome" element={<WelcomeScreen onStart={handleStart} />} />
          <Route 
            path="/main" 
            element={<MobileDashboard onTitleChange={(newTitle) => setTitle(newTitle)} />} 
          />
          <Route 
            path="/my-loans" 
            element={<MobileMyLoansPageContainer />}
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
            element={<FundsPage />}
          />
          <Route 
            path="/sfds" 
            element={<SfdsListPage />}
          />
          <Route 
            path="/sfd/:sfdId" 
            element={<SfdDetailPage />}
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
