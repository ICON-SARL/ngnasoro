
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BadgePercent } from 'lucide-react';
import { LoanPlanCard } from './LoanPlanCard';
import { LoanPlan } from '@/types/sfdClients';

interface LoanPlansDisplayProps {
  subsidizedOnly?: boolean;
  sfdId?: string;
}

export default function LoanPlansDisplay({ subsidizedOnly = false, sfdId }: LoanPlansDisplayProps) {
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, activeSfdId } = useAuth();
  
  useEffect(() => {
    const fetchLoanPlans = async () => {
      setIsLoading(true);
      try {
        // Get only published and active plans
        let query = supabase
          .from('sfd_loan_plans')
          .select(`
            *,
            sfds:sfd_id (
              name,
              logo_url
            )
          `)
          .eq('is_active', true)
          .eq('is_published', true);
          
        // Filter by SFD if specified, otherwise use active SFD ID
        const effectiveSfdId = sfdId || activeSfdId;
        if (effectiveSfdId) {
          query = query.eq('sfd_id', effectiveSfdId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log("Fetched loan plans:", data);
        const typedData = data as unknown as LoanPlan[];
        setLoanPlans(typedData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des plans de prêt:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanPlans();
  }, [user, sfdId, activeSfdId]);
  
  // Filter plans based on whether they're subsidized
  const filteredPlans = loanPlans.filter(plan => {
    if (subsidizedOnly) {
      return plan.name.toLowerCase().includes('subvention') || 
             plan.description?.toLowerCase().includes('subvention');
    } else {
      return !plan.name.toLowerCase().includes('subvention') && 
             !plan.description?.toLowerCase().includes('subvention');
    }
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
              La SFD n'a pas encore publié de plans de prêt.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
