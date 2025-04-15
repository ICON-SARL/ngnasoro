
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
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchLoanPlans = async () => {
      setIsLoading(true);
      try {
        // Get the user's connected SFDs
        let userSfdIds: string[] = [];
        
        if (user?.id) {
          const { data: userSfds } = await supabase
            .from('user_sfds')
            .select('sfd_id')
            .eq('user_id', user.id);
            
          if (userSfds?.length) {
            userSfdIds = userSfds.map(item => item.sfd_id);
          }
        }
        
        // Determine whether to filter by sfd_id
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
          
        // Filter by specific SFD if provided
        if (sfdId) {
          query = query.eq('sfd_id', sfdId);
        } 
        // Otherwise filter by user's connected SFDs
        else if (userSfdIds.length > 0) {
          query = query.in('sfd_id', userSfdIds);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert fetched data to LoanPlan type with necessary transformations
        const typedPlans = (data || []).map(plan => ({
          ...plan,
          is_active: Boolean(plan.is_active),
          is_published: Boolean(plan.is_published),
          requirements: plan.requirements || []
        })) as LoanPlan[];
        
        setLoanPlans(typedPlans);
      } catch (error) {
        console.error('Erreur lors du chargement des plans de prêt:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanPlans();
  }, [user, sfdId]);
  
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
        </div>
      )}
    </div>
  );
}
