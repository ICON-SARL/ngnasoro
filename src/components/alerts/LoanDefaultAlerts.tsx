import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DateDisplay } from '@/components/shared/DateDisplay';

export function LoanDefaultAlerts() {
  const { activeSfdId } = useAuth();
  const navigate = useNavigate();

  const { data: overdueLoans } = useQuery({
    queryKey: ['overdue-loans', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          id,
          amount,
          remaining_amount,
          next_payment_date,
          status,
          client:sfd_clients!client_id(full_name, phone)
        `)
        .eq('sfd_id', activeSfdId)
        .eq('status', 'active')
        .lt('next_payment_date', new Date().toISOString())
        .order('next_payment_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
    refetchInterval: 300000, // Rafraîchir toutes les 5 minutes
  });

  if (!overdueLoans || overdueLoans.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Prêts en retard</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <p className="text-sm">
            {overdueLoans.length} prêt{overdueLoans.length > 1 ? 's' : ''} en retard de paiement
          </p>
          <div className="space-y-1 text-xs">
            {overdueLoans.slice(0, 3).map((loan: any) => (
              <div key={loan.id} className="flex items-center justify-between py-1 border-b border-red-200 last:border-0">
                <span className="font-medium">{loan.client?.full_name}</span>
                <span className="text-muted-foreground">
                  Échéance: <DateDisplay date={loan.next_payment_date} />
                </span>
              </div>
            ))}
            {overdueLoans.length > 3 && (
              <p className="text-muted-foreground pt-1">
                +{overdueLoans.length - 3} autre{overdueLoans.length - 3 > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => navigate('/admin/loans?filter=overdue')}
          >
            Voir tous les retards
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
