import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState, AmountDisplay, DateDisplay, DataTable, StatusBadge } from '@/components/shared';
import { Users, DollarSign, TrendingUp, AlertCircle, Wallet, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SfdAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sfd, setSfd] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [pendingAdhesions, setPendingAdhesions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's SFD
      const { data: userSfd } = await supabase
        .from('user_sfds')
        .select('sfd:sfds(*, stats:sfd_stats(*))')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .single();

      if (!userSfd?.sfd) {
        throw new Error('SFD not found');
      }

      setSfd(userSfd.sfd);
      setStats(userSfd.sfd.stats);

      // Fetch pending loans
      const { data: loans } = await supabase
        .from('sfd_loans')
        .select('*, client:sfd_clients(full_name, client_code)')
        .eq('sfd_id', userSfd.sfd.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingLoans(loans || []);

      // Fetch active loans
      const { data: active } = await supabase
        .from('sfd_loans')
        .select('*, client:sfd_clients(full_name, client_code)')
        .eq('sfd_id', userSfd.sfd.id)
        .eq('status', 'active')
        .order('next_payment_date', { ascending: true });

      setActiveLoans(active || []);

      // Fetch pending adhesions
      const { data: adhesions } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('sfd_id', userSfd.sfd.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingAdhesions(adhesions || []);

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

  if (loading) {
    return <LoadingState message="Chargement du tableau de bord SFD..." />;
  }

  const loanColumns = [
    {
      header: 'Client',
      accessor: (row: any) => row.client?.full_name || '-'
    },
    {
      header: 'Code',
      accessor: (row: any) => <span className="font-mono text-xs">{row.client?.client_code}</span>
    },
    {
      header: 'Montant',
      accessor: (row: any) => <AmountDisplay amount={row.amount} />
    },
    {
      header: 'Durée',
      accessor: (row: any) => `${row.duration_months} mois`
    },
    {
      header: 'Statut',
      accessor: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Date',
      accessor: (row: any) => <DateDisplay date={row.created_at} />
    }
  ];

  const adhesionColumns = [
    {
      header: 'Nom',
      accessor: 'full_name' as const
    },
    {
      header: 'Email',
      accessor: 'email' as const
    },
    {
      header: 'Téléphone',
      accessor: 'phone' as const
    },
    {
      header: 'Date',
      accessor: (row: any) => <DateDisplay date={row.created_at} />
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{sfd?.name}</h1>
        <p className="text-muted-foreground">Tableau de bord administrateur SFD</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clients actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_loans || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sur {stats?.total_loans || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant décaissé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AmountDisplay amount={stats?.total_disbursed || 0} />
            </div>
            <p className="text-xs text-muted-foreground">
              Total cumulé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde subventions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AmountDisplay amount={sfd?.subsidy_balance || 0} />
            </div>
            <p className="text-xs text-muted-foreground">
              Disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(pendingLoans.length > 0 || pendingAdhesions.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingLoans.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                  <Clock className="h-5 w-5" />
                  Prêts en attente
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  {pendingLoans.length} demande(s) à traiter
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {pendingAdhesions.length > 0 && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Users className="h-5 w-5" />
                  Adhésions en attente
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  {pendingAdhesions.length} demande(s) à traiter
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending-loans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending-loans">
            Prêts en attente ({pendingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="active-loans">
            Prêts actifs ({activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="adhesions">
            Adhésions ({pendingAdhesions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-loans">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de prêt en attente</CardTitle>
              <CardDescription>Validez ou rejetez les demandes clients</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={pendingLoans}
                columns={loanColumns}
                searchable
                searchPlaceholder="Rechercher un prêt..."
                emptyMessage="Aucune demande en attente"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-loans">
          <Card>
            <CardHeader>
              <CardTitle>Prêts actifs</CardTitle>
              <CardDescription>Suivez les remboursements en cours</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={activeLoans}
                columns={loanColumns}
                searchable
                searchPlaceholder="Rechercher un prêt..."
                emptyMessage="Aucun prêt actif"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adhesions">
          <Card>
            <CardHeader>
              <CardTitle>Demandes d'adhésion</CardTitle>
              <CardDescription>Validez les nouvelles adhésions</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={pendingAdhesions}
                columns={adhesionColumns}
                searchable
                searchPlaceholder="Rechercher une demande..."
                emptyMessage="Aucune demande d'adhésion"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
