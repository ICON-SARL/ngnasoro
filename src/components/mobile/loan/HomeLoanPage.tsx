
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, ExternalLink, Percent, Calendar, Clock } from 'lucide-react';
import MobileHeader from '../MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';

const HomeLoanPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <MobileHeader 
        title="Prêts" 
        showBackButton={true}
        onBackClick={() => navigate('/mobile-flow/main')}
      />
      
      <div className="p-4">
        <div className="mb-6">
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={() => navigate('/mobile-flow/loan-plans')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande de prêt
          </Button>
        </div>
        
        <h2 className="text-lg font-medium mb-3">Produits de prêt disponibles</h2>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#0D6A51]">
            <h3 className="text-lg font-semibold mb-1">Prêt Express</h3>
            <p className="text-sm text-gray-600 mb-3">
              Prêt rapide pour les besoins urgents, délai d'approbation de 24h à 48h.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-[#0D6A51]">
                  <Percent className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Taux</div>
                <div className="font-medium">5%-8%</div>
              </div>
              
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-[#0D6A51]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Durée</div>
                <div className="font-medium">3-6 mois</div>
              </div>
              
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-[#0D6A51]">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Délai</div>
                <div className="font-medium">24-48h</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                className="text-[#0D6A51]"
                onClick={() => navigate('/mobile-flow/loan-plans')}
              >
                Demander
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-1">Prêt Entreprise</h3>
            <p className="text-sm text-gray-600 mb-3">
              Financement pour les entrepreneurs et petites entreprises.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-blue-600">
                  <Percent className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Taux</div>
                <div className="font-medium">9%-12%</div>
              </div>
              
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-blue-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Durée</div>
                <div className="font-medium">6-12 mois</div>
              </div>
              
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-blue-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Délai</div>
                <div className="font-medium">3-5 jours</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                className="text-blue-600"
                onClick={() => navigate('/mobile-flow/loan-plans')}
              >
                Demander
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/mobile-flow/my-loans')}
          >
            Voir mes prêts actuels
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeLoanPage;
