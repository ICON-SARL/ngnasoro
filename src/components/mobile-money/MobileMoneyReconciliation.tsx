import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AmountDisplay } from '@/components/shared/AmountDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function MobileMoneyReconciliation() {
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const { data: reconciliations, isLoading } = useQuery({
    queryKey: ['mobile-money-reconciliations', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      const { data, error } = await supabase
        .from('mobile_money_reconciliations' as any)
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
  });

  const reconcileMutation = useMutation({
    mutationFn: async (recordIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('reconcile-mobile-money', {
        body: { recordIds, sfdId: activeSfdId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-reconciliations'] });
      setSelectedRecords([]);
      toast({
        title: 'Succès',
        description: 'Réconciliation effectuée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const columns = [
    {
      accessor: 'created_at',
      header: 'Date',
      cell: (value: any) => <DateDisplay date={value} />,
    },
    {
      accessor: 'transaction_reference',
      header: 'Référence',
    },
    {
      accessor: 'operator',
      header: 'Opérateur',
    },
    {
      accessor: 'amount',
      header: 'Montant',
      cell: (value: any) => <AmountDisplay amount={value} />,
    },
    {
      accessor: 'status',
      header: 'Statut',
      cell: (value: any) => <StatusBadge status={value} />,
    },
    {
      accessor: 'id',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (selectedRecords.includes(row.id)) {
                  setSelectedRecords(selectedRecords.filter(id => id !== row.id));
                } else {
                  setSelectedRecords([...selectedRecords, row.id]);
                }
              }}
            >
              {selectedRecords.includes(row.id) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleReconcile = () => {
    if (selectedRecords.length === 0) {
      toast({
        title: 'Attention',
        description: 'Veuillez sélectionner au moins une transaction',
        variant: 'destructive',
      });
      return;
    }
    reconcileMutation.mutate(selectedRecords);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Réconciliation Mobile Money</span>
          {selectedRecords.length > 0 && (
            <Button onClick={handleReconcile} disabled={reconcileMutation.isPending}>
              Réconcilier ({selectedRecords.length})
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <DataTable
            data={(reconciliations as any) || []}
            columns={columns as any}
          />
        )}
      </CardContent>
    </Card>
  );
}
