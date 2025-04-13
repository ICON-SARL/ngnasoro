
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import AccountPage from '@/pages/mobile/AccountPage';
import NotificationsPage from '@/pages/mobile/account/NotificationsPage';
import SecurityPage from '@/pages/mobile/account/SecurityPage';
import AboutPage from '@/pages/mobile/account/AboutPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';

const MobileFlowPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    // Si l'utilisateur est admin ou sfd_admin, rediriger vers le tableau de bord approprié
    if (!loading && user) {
      const userRole = user.app_metadata?.role;
      if (userRole === 'admin') {
        toast({
          title: "Accès refusé",
          description: "Les administrateurs ne peuvent pas accéder à l'interface mobile.",
          variant: "destructive",
        });
        navigate('/super-admin-dashboard');
      } else if (userRole === 'sfd_admin') {
        toast({
          title: "Accès refusé",
          description: "Les administrateurs SFD ne peuvent pas accéder à l'interface mobile.",
          variant: "destructive",
        });
        navigate('/agency-dashboard');
      }
    }
  }, [user, loading, navigate, toast]);

  if (loading) {
    return <div className="p-4 flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Chargement...</span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="main" element={
          <div className="pb-20">
            <div className="p-4 bg-[#0D6A51] text-white">
              <h1 className="text-xl font-bold">Dashboard principal</h1>
              <p className="text-sm">Bienvenue sur votre espace client</p>
            </div>
            <div className="p-4">
              <div className="bg-white rounded-lg p-4 shadow mb-4">
                <h2 className="text-lg font-semibold mb-2">Votre compte</h2>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">Solde disponible</p>
                  <p className="text-2xl font-bold">0 FCFA</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  className="bg-white p-4 rounded-lg shadow text-center"
                  onClick={() => navigate('/mobile-flow/savings')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-green-600">💰</span>
                    </div>
                    <span className="text-sm font-medium">Mes fonds</span>
                  </div>
                </button>
                
                <button 
                  className="bg-white p-4 rounded-lg shadow text-center"
                  onClick={() => navigate('/mobile-flow/loans')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-blue-600">💳</span>
                    </div>
                    <span className="text-sm font-medium">Prêts</span>
                  </div>
                </button>
              </div>
              
              <button 
                className="w-full bg-[#0D6A51] text-white py-3 px-4 rounded-lg font-medium"
                onClick={() => navigate('/mobile-flow/profile')}
              >
                Voir mon profil
              </button>
            </div>
          </div>
        } />
        
        <Route path="profile" element={<ProfilePage />} />
        <Route path="savings" element={<FundsManagementPage />} />
        <Route path="loans" element={<div className="p-4">Prêts (À venir)</div>} />
        <Route path="transactions" element={<div className="p-4">Transactions (À venir)</div>} />
        
        <Route path="account" element={<AccountPage />} />
        <Route path="account/notifications" element={<NotificationsPage />} />
        <Route path="account/security" element={<SecurityPage />} />
        <Route path="account/about" element={<AboutPage />} />
        <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
        
        {/* Redirection par défaut vers le dashboard principal */}
        <Route path="*" element={<Navigate to="main" replace />} />
      </Routes>
    </div>
  );
};

export default MobileFlowPage;
