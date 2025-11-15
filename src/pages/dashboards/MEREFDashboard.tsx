import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/LoadingState';
import { AmountDisplay } from '@/components/shared/AmountDisplay';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLogout from '@/components/admin/shared/AdminLogout';

export default function MEREFDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSfds: 0,
    activeSfds: 0,
    totalClients: 0,
    totalSubsidies: 0,
    pendingRequests: 0,
    totalDisbursed: 0
  });
  const [sfds, setSfds] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch SFDs
      const { data: sfdsData } = await supabase
        .from('sfds')
        .select('*, stats:sfd_stats(*)')
        .order('created_at', { ascending: false });

      setSfds(sfdsData || []);

      // Fetch pending subsidy requests
      const { data: requests } = await supabase
        .from('subsidy_requests')
        .select('*, sfd:sfds(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingRequests(requests || []);

      // Calculate stats
      const activeSfds = sfdsData?.filter(s => s.status === 'active').length || 0;
      const totalClients = sfdsData?.reduce((sum, s) => sum + (s.stats?.total_clients || 0), 0) || 0;
      const totalDisbursed = sfdsData?.reduce((sum, s) => sum + (s.stats?.total_disbursed || 0), 0) || 0;

      // Total subsidies allocated
      const { data: subsidies } = await supabase
        .from('sfd_subsidies')
        .select('amount')
        .eq('status', 'active');

      const totalSubsidies = subsidies?.reduce((sum, s) => sum + s.amount, 0) || 0;

      setStats({
        totalSfds: sfdsData?.length || 0,
        activeSfds,
        totalClients,
        totalSubsidies,
        pendingRequests: requests?.length || 0,
        totalDisbursed
      });
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
    return <LoadingState message="Chargement du tableau de bord MEREF..." />;
  }

  const sfdColumns = [
    {
      header: 'SFD',
      accessor: 'name' as const
    },
    {
      header: 'Code',
      accessor: 'code' as const
    },
    {
      header: 'Région',
      accessor: 'region' as const
    },
    {
      header: 'Statut',
      accessor: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Clients',
      accessor: (row: any) => row.stats?.total_clients || 0
    },
    {
      header: 'Solde subventions',
      accessor: (row: any) => <AmountDisplay amount={row.subsidy_balance || 0} />
    }
  ];

  const requestColumns = [
    {
      header: 'SFD',
      accessor: (row: any) => row.sfd?.name || '-'
    },
    {
      header: 'Montant',
      accessor: (row: any) => <AmountDisplay amount={row.amount} />
    },
    {
      header: 'Priorité',
      accessor: (row: any) => <StatusBadge status={row.priority} />
    },
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.created_at).toLocaleDateString('fr-FR')
    },
    {
      header: 'Alerte',
      accessor: (row: any) => row.alert_triggered ? (
        <AlertTriangle className="h-4 w-4 text-orange-600" />
      ) : null
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord MEREF</h1>
          <p className="text-muted-foreground">Vue d'ensemble du système de microfinance</p>
        </div>
        <AdminLogout variant="ghost" size="sm" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SFD</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSfds}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSfds} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tous les SFD confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subventions allouées</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AmountDisplay amount={stats.totalSubsidies} />
            </div>
            <p className="text-xs text-muted-foreground">
              En cours d'utilisation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts décaissés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AmountDisplay amount={stats.totalDisbursed} />
            </div>
            <p className="text-xs text-muted-foreground">
              Total cumulé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Alert */}
      {stats.pendingRequests > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5" />
              Demandes en attente
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              {stats.pendingRequests} demande(s) de subvention nécessite(nt) votre attention
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pending Requests Table */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demandes de subventions en attente</CardTitle>
            <CardDescription>
              Validez ou rejetez les demandes des SFD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={pendingRequests}
              columns={requestColumns}
              emptyMessage="Aucune demande en attente"
            />
          </CardContent>
        </Card>
      )}

      {/* SFDs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des SFD</CardTitle>
          <CardDescription>
            Vue d'ensemble de tous les SFD du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sfds}
            columns={sfdColumns}
            searchable
            searchPlaceholder="Rechercher un SFD..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
