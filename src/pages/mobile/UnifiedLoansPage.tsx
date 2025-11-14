import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { LoanPlan } from '@/types/sfdClients';
import ActiveLoanCard from '@/components/mobile/loans/ActiveLoanCard';
import LoanPlanCard from '@/components/mobile/loans/LoanPlanCard';
import LoanStatsCard from '@/components/mobile/loans/LoanStatsCard';
import LoanRequestSheet from '@/components/mobile/loans/LoanRequestSheet';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const UnifiedLoansPage = () => {
  const navigate = useNavigate();
  const { getActiveSfdData } = useSfdDataAccess();
  const [activeSfd, setActiveSfd] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  
  // Fetch active SFD
  useEffect(() => {
    getActiveSfdData().then(sfd => setActiveSfd(sfd));
  }, []);

  // Fetch loans
  const { loans, isLoading: isLoadingLoans } = useSfdLoans();
  
  // Fetch loan plans
  const { data: loanPlans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['loan-plans', activeSfd?.id],
    queryFn: async () => {
      if (!activeSfd?.id) return [];
      
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfd.id)
        .eq('is_active', true)
        .order('min_amount');
        
      if (error) throw error;
      return data as LoanPlan[];
    },
    enabled: !!activeSfd?.id
  });

  // Filter active and completed loans
  const activeLoans = loans?.filter(loan => 
    loan.status === 'active' || loan.status === 'approved' || loan.status === 'disbursed'
  ) || [];
  
  const completedLoans = loans?.filter(loan => 
    loan.status === 'completed'
  ) || [];

  const handleRequestLoan = (plan: LoanPlan) => {
    setSelectedPlan(plan);
  };

  const handleViewDetails = (loanId: string) => {
    navigate(`/mobile-flow/loans/${loanId}`);
  };

  const handleRepay = (loanId: string) => {
    navigate(`/mobile-flow/loans/${loanId}?tab=repayment`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/mobile-flow/dashboard')}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Prêts</h1>
            {activeSfd && (
              <p className="text-sm text-muted-foreground">{activeSfd.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics */}
        <LoanStatsCard loans={loans || []} />

        {/* Active Loans Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Mes prêts en cours
            </h2>
            <span className="text-sm text-muted-foreground">
              {activeLoans.length}
            </span>
          </div>

          {isLoadingLoans ? (
            <div className="space-y-3">
              <Skeleton className="h-40 rounded-3xl" />
              <Skeleton className="h-40 rounded-3xl" />
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="bg-card rounded-3xl p-6 text-center">
              <p className="text-muted-foreground">Aucun prêt en cours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoans.map(loan => (
                <ActiveLoanCard
                  key={loan.id}
                  loan={loan}
                  onViewDetails={handleViewDetails}
                  onRepay={handleRepay}
                />
              ))}
            </div>
          )}
        </section>

        {/* Request New Loan Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Demander un nouveau prêt
            </h2>
          </div>

          {isLoadingPlans ? (
            <div className="space-y-3">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </div>
          ) : loanPlans.length === 0 ? (
            <div className="bg-card rounded-3xl p-6 text-center">
              <p className="text-muted-foreground">
                Aucun plan de prêt disponible actuellement
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {loanPlans.map(plan => (
                <LoanPlanCard
                  key={plan.id}
                  plan={plan}
                  onRequest={handleRequestLoan}
                />
              ))}
            </div>
          )}
        </section>

        {/* Loan History Section */}
        {completedLoans.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Historique des prêts
            </h2>
            <div className="space-y-2">
              {completedLoans.slice(0, 3).map(loan => (
                <div
                  key={loan.id}
                  onClick={() => handleViewDetails(loan.id)}
                  className="bg-card rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {loan.purpose || 'Prêt'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(loan.created_at).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {loan.amount.toLocaleString()} FCFA
                    </p>
                    <span className="text-xs text-green-600">✓ Remboursé</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Loan Request Sheet */}
      {selectedPlan && (
        <LoanRequestSheet
          plan={selectedPlan}
          sfdId={activeSfd?.id}
          open={!!selectedPlan}
          onOpenChange={(open) => !open && setSelectedPlan(null)}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default UnifiedLoansPage;
