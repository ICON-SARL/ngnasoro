
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Percent, CreditCard, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { asString } from '@/utils/typeSafeAccess';

interface LoanPlan {
  id: string;
  sfd_id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

interface SfdItem {
  id: string;
  name: string;
}

export default function LoanPlansDisplay() {
  const { user } = useAuth();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [sfdList, setSfdList] = useState<SfdItem[]>([]);

  useEffect(() => {
    const fetchUserSfds = async () => {
      if (!user) return;

      try {
        const { data: userSfds, error } = await supabase
          .from('user_sfds')
          .select('sfd_id, sfds(id, name)')
          .eq('user_id', user.id);

        if (error) throw error;

        if (userSfds && Array.isArray(userSfds)) {
          const sfds: SfdItem[] = userSfds.map(item => {
            // Properly access nested properties with type checking
            if (item && item.sfds && typeof item.sfds === 'object') {
              const sfdObject = item.sfds as Record<string, any>;
              return {
                id: asString(sfdObject.id, ''),
                name: asString(sfdObject.name, '')
              };
            }
            return { id: '', name: '' };
          }).filter(sfd => sfd.id !== ''); // Filter out invalid SFDs
          
          setSfdList(sfds);
          
          // Select first SFD by default
          if (sfds.length > 0 && !selectedSfd) {
            setSelectedSfd(sfds[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching user SFDs:', error);
      }
    };

    fetchUserSfds();
  }, [user, selectedSfd]);

  useEffect(() => {
    const fetchLoanPlans = async () => {
      if (!selectedSfd) return;
      
      setLoading(true);
      try {
        // Fetch loan plans for the selected SFD
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('sfd_id', selectedSfd)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLoanPlans(data || []);
      } catch (error) {
        console.error('Error fetching loan plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanPlans();
  }, [selectedSfd]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
        {sfdList.map(sfd => (
          <button
            key={sfd.id}
            onClick={() => setSelectedSfd(sfd.id)}
            className={`px-4 py-2 mr-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedSfd === sfd.id 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sfd.name}
          </button>
        ))}
      </div>

      {loanPlans.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">Aucun plan de prêt disponible pour cette SFD</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loanPlans.map(plan => (
            <Card key={plan.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    Actif
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Montant</p>
                      <p className="font-medium">{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Durée</p>
                      <p className="font-medium">{plan.min_duration} - {plan.max_duration} mois</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Taux d'intérêt</p>
                      <p className="font-medium">{plan.interest_rate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Frais</p>
                      <p className="font-medium">{plan.fees}%</p>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 flex justify-center items-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-gray-100">
                  Voir détails <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
