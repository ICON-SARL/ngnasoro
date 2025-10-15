
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BadgePercent } from 'lucide-react';
import { LoanPlanCard } from './LoanPlanCard';
import { LoanPlan } from '@/types/sfdClients';
import { useToast } from '@/hooks/use-toast';

interface LoanPlansDisplayProps {
  subsidizedOnly?: boolean;
  sfdId?: string;
}

interface DbLoanPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  duration_months: number;
  interest_rate: number;
  is_active: boolean;
  sfd_id: string;
  created_at: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export default function LoanPlansDisplay({ subsidizedOnly = false, sfdId }: LoanPlansDisplayProps) {
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchLoanPlans = async () => {
      setIsLoading(true);
      try {
        // Determine which SFD ID to use
        const effectiveSfdId = sfdId || activeSfdId;
        console.log('LoanPlansDisplay - Fetching plans for SFD:', effectiveSfdId);
        
        if (!effectiveSfdId) {
          console.log('No SFD ID available, cannot fetch plans');
          setLoanPlans([]);
          setIsLoading(false);
          return;
        }
        
        // Get only published and active plans for the specific SFD
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select(`
            *,
            sfds:sfd_id (
              name,
              logo_url
            )
          `)
          .eq('sfd_id', effectiveSfdId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching loan plans:', error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les plans de prêt",
            variant: "destructive",
          });
          throw error;
        }
        
        console.log('LoanPlansDisplay - Fetched raw plans:', data?.length);
        
        // Map database plans to LoanPlan type
        const mappedPlans: LoanPlan[] = (data as DbLoanPlan[] || []).map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          min_amount: plan.min_amount,
          max_amount: plan.max_amount,
          duration_months: plan.duration_months,
          interest_rate: plan.interest_rate,
          is_active: plan.is_active,
          sfd_id: plan.sfd_id,
          created_at: plan.created_at,
          sfds: plan.sfds
        }));
        setLoanPlans(mappedPlans);
      } catch (error) {
        console.error('Error in fetchLoanPlans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanPlans();
  }, [user, sfdId, activeSfdId, toast]);
  
  // Filter plans based on whether they're subsidized
  const filteredPlans = loanPlans.filter(plan => {
    const isSubsidized = plan.name.toLowerCase().includes('subvention') || 
                        plan.description?.toLowerCase().includes('subvention');
                        
    return subsidizedOnly ? isSubsidized : !isSubsidized;
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="space-y-3">
          {filteredPlans.map(plan => (
            <LoanPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <BadgePercent className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-500">
            Aucun plan de prêt {subsidizedOnly ? 'subventionné' : ''} disponible
          </p>
          {!subsidizedOnly && activeSfdId && (
            <p className="text-sm text-gray-400 mt-2">
              Votre SFD n'a pas encore publié de plans de prêt.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
