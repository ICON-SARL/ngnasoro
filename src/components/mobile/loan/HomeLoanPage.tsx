
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, ExternalLink, Percent, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const HomeLoanPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId, user } = useAuth();
  const { sfds, isLoading } = useSfdDataAccess();
  
  const activeSfd = sfds.find(sfd => sfd.id === activeSfdId);
  
  useEffect(() => {
    // Log debug information
    console.log('HomeLoanPage - Current state:', {
      userId: user?.id,
      userEmail: user?.email,
      activeSfdId,
      activeSfdName: activeSfd?.name,
      allSfds: sfds.map(s => ({ id: s.id, name: s.name }))
    });
  }, [user, activeSfdId, activeSfd, sfds]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Prêts</h1>
          {activeSfd && (
            <p className="text-sm text-gray-600">{activeSfd.name}</p>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {!activeSfdId && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertCircle className="text-amber-500 h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Aucune SFD active</p>
              <p className="text-sm text-amber-700">Veuillez accéder à votre profil pour associer votre compte à une SFD.</p>
              <Button 
                variant="outline"
                className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                size="sm"
                onClick={() => navigate('/mobile-flow/profile')}
              >
                Gérer mes SFDs
              </Button>
            </div>
          </div>
        )}
      
        <div className="mb-6">
          <Button 
            className="w-full bg-lime-600 hover:bg-lime-700"
            onClick={() => navigate('/mobile-flow/loan-plans')}
            disabled={!activeSfdId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande de prêt
          </Button>
        </div>
        
        <h2 className="text-lg font-medium mb-3">Produits de prêt disponibles</h2>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-lime-500">
            <h3 className="text-lg font-semibold mb-1">Prêt Express</h3>
            <p className="text-sm text-gray-600 mb-3">
              Prêt rapide pour les besoins urgents, délai d'approbation de 24h à 48h.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-lime-600">
                  <Percent className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Taux</div>
                <div className="font-medium">5%-8%</div>
              </div>
              
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-lime-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Durée</div>
                <div className="font-medium">3-6 mois</div>
              </div>
              
              <div className="text-center bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-center mb-1 text-lime-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-xs text-gray-500">Délai</div>
                <div className="font-medium">24-48h</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                className="text-lime-600"
                onClick={() => navigate('/mobile-flow/loan-plans')}
                disabled={!activeSfdId}
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
                disabled={!activeSfdId}
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
