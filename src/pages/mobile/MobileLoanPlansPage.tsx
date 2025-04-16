
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Clock, Percent, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { LoanPlan } from '@/types/sfdClients';

const MobileLoanPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchLoanPlans = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select(`
            id,
            name,
            description,
            min_amount,
            max_amount,
            min_duration,
            max_duration,
            interest_rate,
            fees,
            is_active,
            is_published,
            requirements,
            sfd_id,
            created_at,
            updated_at,
            sfds (
              name,
              logo_url
            )
          `)
          .eq('is_published', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setLoanPlans(data || []);
        setFilteredPlans(data || []);
      } catch (error) {
        console.error('Error fetching loan plans:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les plans de prêt',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanPlans();
  }, [toast]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlans(loanPlans);
    } else {
      const filtered = loanPlans.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.sfds?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlans(filtered);
    }
  }, [searchTerm, loanPlans]);
  
  const handleApplyForLoan = (plan: LoanPlan) => {
    navigate('/mobile-flow/loan-application', { state: { planId: plan.id } });
  };
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/loans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Plans de Prêt</h1>
      </div>
      
      <div className="p-4 pb-16">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9 pr-4"
            placeholder="Rechercher un plan de prêt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-gray-500">Chargement des plans de prêt...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center p-8">
            <h2 className="text-lg font-medium">Aucun plan trouvé</h2>
            <p className="text-gray-500 mt-2">
              Aucun plan de prêt ne correspond à votre recherche.
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Réinitialiser la recherche
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-sm text-gray-500">
                          {plan.sfds?.name || 'SFD non spécifiée'}
                        </p>
                      </div>
                      {plan.sfds?.logo_url && (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img 
                            src={plan.sfds.logo_url} 
                            alt={plan.sfds.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="flex items-center mb-1">
                          <CreditCard className="h-4 w-4 text-[#0D6A51] mr-1" />
                          <span className="text-xs text-gray-500">Montant</span>
                        </div>
                        <p className="text-sm font-medium">
                          {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="flex items-center mb-1">
                          <Clock className="h-4 w-4 text-[#0D6A51] mr-1" />
                          <span className="text-xs text-gray-500">Durée</span>
                        </div>
                        <p className="text-sm font-medium">
                          {plan.min_duration} - {plan.max_duration} mois
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="flex items-center mb-1">
                          <Percent className="h-4 w-4 text-[#0D6A51] mr-1" />
                          <span className="text-xs text-gray-500">Taux d'intérêt</span>
                        </div>
                        <p className="text-sm font-medium">{plan.interest_rate}%</p>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="flex items-center mb-1">
                          <Filter className="h-4 w-4 text-[#0D6A51] mr-1" />
                          <span className="text-xs text-gray-500">Frais</span>
                        </div>
                        <p className="text-sm font-medium">{plan.fees}%</p>
                      </div>
                    </div>
                    
                    {plan.requirements && plan.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Conditions requises:</p>
                        <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                          {plan.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                      onClick={() => handleApplyForLoan(plan)}
                    >
                      Demander ce prêt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileLoanPlansPage;
