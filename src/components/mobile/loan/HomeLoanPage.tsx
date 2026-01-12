
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, ExternalLink, Percent, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const HomeLoanPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId, user } = useAuth();
  const { sfds, isLoading } = useSfdDataAccess();
  
  const activeSfd = sfds.find(sfd => sfd.id === activeSfdId);
  
  // Fetch real loan plans from database
  const { data: loanPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['loan-plans', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .eq('is_active', true)
        .order('interest_rate', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeSfdId
  });
  
  useEffect(() => {
    console.log('HomeLoanPage - Current state:', {
      userId: user?.id,
      userEmail: user?.email,
      activeSfdId,
      activeSfdName: activeSfd?.name,
      allSfds: sfds.map(s => ({ id: s.id, name: s.name })),
      loanPlansCount: loanPlans?.length || 0
    });
  }, [user, activeSfdId, activeSfd, sfds, loanPlans]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/dashboard')}
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
        
        {plansLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-lime-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-3">Chargement des plans...</p>
          </div>
        ) : loanPlans && loanPlans.length > 0 ? (
          <div className="space-y-4">
            {loanPlans.map((plan, index) => {
              const borderColor = index === 0 ? 'border-lime-500' : 'border-blue-500';
              const textColor = index === 0 ? 'text-lime-600' : 'text-blue-600';
              
              return (
                <div key={plan.id} className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${borderColor}`}>
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{plan.description || 'Plan de prêt disponible'}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center bg-gray-50 p-2 rounded">
                      <div className={`flex items-center justify-center mb-1 ${textColor}`}>
                        <Percent className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-gray-500">Taux</div>
                      <div className="font-medium">{plan.interest_rate}%</div>
                    </div>
                    
                    <div className="text-center bg-gray-50 p-2 rounded">
                      <div className={`flex items-center justify-center mb-1 ${textColor}`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-gray-500">Durée</div>
                      <div className="font-medium">{plan.duration_months} mois</div>
                    </div>
                    
                    <div className="text-center bg-gray-50 p-2 rounded">
                      <div className={`flex items-center justify-center mb-1 ${textColor}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-gray-500">Montant</div>
                      <div className="font-medium text-xs">
                        {(plan.min_amount / 1000).toFixed(0)}K-{(plan.max_amount / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      className={textColor}
                      onClick={() => navigate('/mobile-flow/loan-application', {
                        state: { planId: plan.id, sfdId: activeSfdId }
                      })}
                    >
                      Demander
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun plan de prêt disponible pour le moment.</p>
          </div>
        )}
        
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
