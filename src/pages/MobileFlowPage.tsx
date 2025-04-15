import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import MobileNavigation from '@/components/MobileNavigation';
import ClientProfilePage from '@/components/mobile/profile/ClientProfilePage';

const MobileFlowPage: React.FC = () => {
  const { user, loading, isAdmin, isSfdAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const role = user.app_metadata?.role;
      
      if (role === 'admin') {
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur.",
        });
        navigate('/super-admin-dashboard');
        return;
      } 
      
      if (role === 'sfd_admin') {
        toast({
          title: "Redirection",
          description: "Vous êtes connecté en tant qu'administrateur SFD.",
        });
        navigate('/agency-dashboard');
        return;
      }
    }
  }, [user, loading, navigate, toast, isAdmin, isSfdAdmin]);

  if (loading) {
    return <div className="p-4 flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Chargement...</span>
    </div>;
  }

  const handleAction = (action: string, data?: any) => {
    console.log('Action triggered:', action, data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow">
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
          
          <Route path="profile" element={<ClientProfilePage />} />
          <Route path="savings" element={<div className="p-4">Mes fonds (À venir)</div>} />
          <Route path="loans" element={<div className="p-4">Prêts (À venir)</div>} />
          
          <Route index element={<Navigate to="main" replace />} />
        </Routes>
      </div>
      
      <MobileNavigation onAction={handleAction} />
      <Footer />
    </div>
  );
};

export default MobileFlowPage;
