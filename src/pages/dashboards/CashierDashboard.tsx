import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { AmountDisplay } from '@/components/shared/AmountDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Wallet, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLogout from '@/components/admin/shared/AdminLogout';
import { CashSessionManager } from '@/components/cash/CashSessionManager';

export default function CashierDashboard() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [todayOperations, setTodayOperations] = useState<any[]>([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionDialogMode, setSessionDialogMode] = useState<'open' | 'close'>('open');
  const [stats, setStats] = useState({
    openingBalance: 0,
    currentBalance: 0,
    totalIn: 0,
    totalOut: 0,
    operationsCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch current session for today
      const { data: session } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('cashier_id', user?.id)
        .eq('status', 'open')
        .gte('opened_at', today)
        .maybeSingle();

      setCurrentSession(session);

      if (session) {
        // Fetch today's operations
        const { data: operations } = await supabase
          .from('cash_operations')
          .select('*, client:sfd_clients(full_name)')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false });

        setTodayOperations(operations || []);

        // Calculate stats
        const totalIn = operations?.filter(op => 
          ['deposit', 'loan_repayment', 'transfer_in'].includes(op.operation_type)
        ).reduce((sum, op) => sum + op.amount, 0) || 0;

        const totalOut = operations?.filter(op => 
          ['withdrawal', 'loan_disbursement', 'transfer_out'].includes(op.operation_type)
        ).reduce((sum, op) => sum + op.amount, 0) || 0;

        setStats({
          openingBalance: session.opening_balance,
          currentBalance: session.opening_balance + totalIn - totalOut,
          totalIn,
          totalOut,
          operationsCount: operations?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSession = () => {
    setSessionDialogMode('open');
    setSessionDialogOpen(true);
  };

  const handleCloseSession = () => {
    setSessionDialogMode('close');
    setSessionDialogOpen(true);
  };

  if (loading) {
    return <LoadingState message="Chargement du tableau de bord..." />;
  }

  const operationColumns = [
    {
      header: 'Heure',
      accessor: (row: any) => new Date(row.performed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },
    {
      header: 'Type',
      accessor: (row: any) => {
        const typeLabels: Record<string, string> = {
          deposit: 'Dépôt',
          withdrawal: 'Retrait',
          loan_disbursement: 'Décaissement prêt',
          loan_repayment: 'Remboursement prêt',
          transfer_in: 'Transfert entrant',
          transfer_out: 'Transfert sortant'
        };
        return typeLabels[row.operation_type] || row.operation_type;
      }
    },
    {
      header: 'Client',
      accessor: (row: any) => row.client?.full_name || '-'
    },
    {
      header: 'Montant',
      accessor: (row: any) => <AmountDisplay amount={row.amount} colorize />
    },
    {
      header: 'Référence',
      accessor: 'reference' as any
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Caissier</h1>
          <p className="text-muted-foreground">Gérez vos opérations de caisse</p>
        </div>
        <div className="flex items-center gap-2">
          {currentSession ? (
            <Button onClick={handleCloseSession} variant="destructive">
              Fermer la caisse
            </Button>
          ) : (
            <Button onClick={handleOpenSession}>
              Ouvrir la caisse
            </Button>
          )}
          <AdminLogout variant="ghost" size="sm" />
        </div>
      </div>

      {!currentSession ? (
        <EmptyState
          icon={Wallet}
          title="Aucune caisse ouverte"
          description="Vous devez d'abord ouvrir une caisse pour effectuer des opérations"
          action={{
            label: 'Ouvrir la caisse',
            onClick: handleOpenSession
          }}
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde d'ouverture</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AmountDisplay amount={stats.openingBalance} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde actuel</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AmountDisplay amount={stats.currentBalance} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrées</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  <AmountDisplay amount={stats.totalIn} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dépôts et remboursements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sorties</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  <AmountDisplay amount={stats.totalOut} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Retraits et décaissements
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session en cours</span>
                <StatusBadge status="open" />
              </CardTitle>
              <CardDescription>
                Ouverte le {new Date(currentSession.opened_at).toLocaleString('fr-FR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-lg font-semibold">{new Date(currentSession.session_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opérations</p>
                  <p className="text-lg font-semibold">{stats.operationsCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Différence</p>
                  <p className="text-lg font-semibold">
                    <AmountDisplay 
                      amount={stats.currentBalance - stats.openingBalance} 
                      showSign 
                      colorize 
                    />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Opérations du jour</CardTitle>
              <CardDescription>
                Liste de toutes les opérations effectuées aujourd'hui
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayOperations.length === 0 ? (
                <EmptyState
                  title="Aucune opération"
                  description="Aucune opération n'a été effectuée aujourd'hui"
                />
              ) : (
                <DataTable
                  data={todayOperations}
                  columns={operationColumns}
                  searchable
                  searchPlaceholder="Rechercher une opération..."
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
      
      <CashSessionManager
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        mode={sessionDialogMode}
        sfdId={activeSfdId}
        currentSession={currentSession}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
