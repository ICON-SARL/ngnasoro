
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MobileDashboardPage from '@/pages/mobile/MobileDashboardPage';
import MobileProfilePage from '@/pages/mobile/MobileProfilePage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileDiagnosticsPage from '@/pages/mobile/MobileDiagnosticsPage';

const MobileRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p>Veuillez vous connecter pour accéder à l'application mobile.</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/main" element={<MobileDashboardPage />} />
      <Route path="/profile" element={<MobileProfilePage />} />
      <Route path="/loans" element={<MobileLoansPage />} />
      <Route path="/loan-plans" element={<MobileLoanPlansPage />} />
      <Route path="/loan-application" element={<MobileLoanApplicationPage />} />
      <Route path="/loan-details/:id" element={<div>Détails du prêt</div>} /> 
      <Route path="/diagnostics" element={<MobileDiagnosticsPage />} />
      <Route path="*" element={<MobileDashboardPage />} />
    </Routes>
  );
};

export default MobileRouter;
