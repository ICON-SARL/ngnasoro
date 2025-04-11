
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">MEREF SFD</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="px-4 py-2"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-12 px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Bienvenue sur la plateforme MEREF SFD</h2>
          <p className="text-xl text-gray-600 mb-8">
            Une solution de gestion intégrée pour les Systèmes Financiers Décentralisés
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              size="lg"
            >
              Commencer maintenant
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">Pour les SFD</h3>
            <p className="text-gray-600">
              Gérez vos clients, demandes de crédits, et subventions efficacement à travers notre plateforme intégrée.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">Pour les Clients</h3>
            <p className="text-gray-600">
              Accédez à vos comptes, suivez vos prêts et effectuez des demandes de crédit en toute simplicité.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3">Pour les Administrateurs</h3>
            <p className="text-gray-600">
              Supervisez l'ensemble des SFD, gérez les subventions et accédez aux statistiques globales.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 MEREF SFD. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
