
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components';

const AgencyDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication and redirect if needed
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/sfd/auth');
        return;
      }
      
      // Check if user has proper role
      const userRole = user.app_metadata?.role;
      if (userRole !== 'sfd_admin') {
        navigate('/access-denied');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="p-8 text-center">Chargement du tableau de bord SFD...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Tableau de Bord SFD</h1>
        <p className="mb-4">Bienvenue sur votre tableau de bord d'administration SFD.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-medium text-lg mb-2">Clients</h2>
            <p>Gérer les comptes clients et leurs informations.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-medium text-lg mb-2">Prêts</h2>
            <p>Superviser les demandes et approbations de prêts.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-medium text-lg mb-2">Transactions</h2>
            <p>Suivre les transactions et les mouvements de fonds.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgencyDashboard;
