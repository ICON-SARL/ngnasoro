import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalSfds: number;
  activeSfds: number;
  pendingSfds: number;
  suspendedSfds: number;
  totalClients: number;
  totalLoans: number;
  totalSubsidies: number;
  pendingSubsidies: number;
}

interface ChartData {
  monthlyClients: { month: string; clients: number }[];
  sfdPerformance: { name: string; loans: number; clients: number }[];
  loanStatus: { name: string; value: number; color: string }[];
}

export function MerefEnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSfds: 0,
    activeSfds: 0,
    pendingSfds: 0,
    suspendedSfds: 0,
    totalClients: 0,
    totalLoans: 0,
    totalSubsidies: 0,
    pendingSubsidies: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    monthlyClients: [],
    sfdPerformance: [],
    loanStatus: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch SFD stats
      const { data: sfdsData, error: sfdsError } = await supabase
        .from('sfds')
        .select('status');

      if (sfdsError) throw sfdsError;

      const sfdStats = {
        totalSfds: sfdsData?.length || 0,
        activeSfds: sfdsData?.filter(s => s.status === 'active').length || 0,
        pendingSfds: sfdsData?.filter(s => s.status === 'pending').length || 0,
        suspendedSfds: sfdsData?.filter(s => s.status === 'suspended').length || 0
      };

      // Fetch client count
      const { count: clientCount, error: clientError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true });

      if (clientError) throw clientError;

      // Fetch loan stats
      const { data: loansData, error: loansError } = await supabase
        .from('sfd_loans')
        .select('status');

      if (loansError) throw loansError;

      // Fetch subsidy stats
      const { data: subsidiesData, error: subsidiesError } = await supabase
        .from('subsidy_requests')
        .select('status');

      if (subsidiesError) throw subsidiesError;

      // Mock monthly client data (in real app, would be from database)
      const monthlyClients = [
        { month: 'Jan', clients: 150 },
        { month: 'Fév', clients: 180 },
        { month: 'Mar', clients: 220 },
        { month: 'Avr', clients: 280 },
        { month: 'Mai', clients: 350 },
        { month: 'Jun', clients: 420 }
      ];

      // Fetch top SFDs
      const { data: topSfds, error: topSfdsError } = await supabase
        .from('sfd_stats')
        .select(`
          *,
          sfds!sfd_id (name)
        `)
        .order('total_clients', { ascending: false })
        .limit(5);

      if (topSfdsError) throw topSfdsError;

      const sfdPerformance = topSfds?.map(s => ({
        name: s.sfds?.name || 'Inconnu',
        loans: s.total_loans || 0,
        clients: s.total_clients || 0
      })) || [];

      // Loan status distribution
      const loanStatus = [
        { 
          name: 'Actifs', 
          value: loansData?.filter(l => l.status === 'active').length || 0,
          color: '#10b981'
        },
        { 
          name: 'Complétés', 
          value: loansData?.filter(l => l.status === 'completed').length || 0,
          color: '#3b82f6'
        },
        { 
          name: 'En défaut', 
          value: loansData?.filter(l => l.status === 'defaulted').length || 0,
          color: '#ef4444'
        },
        { 
          name: 'En attente', 
          value: loansData?.filter(l => l.status === 'pending').length || 0,
          color: '#f59e0b'
        }
      ];

      setStats({
        ...sfdStats,
        totalClients: clientCount || 0,
        totalLoans: loansData?.length || 0,
        totalSubsidies: subsidiesData?.length || 0,
        pendingSubsidies: subsidiesData?.filter(s => s.status === 'pending').length || 0
      });

      setChartData({
        monthlyClients,
        sfdPerformance,
        loanStatus: loanStatus.filter(l => l.value > 0)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Erreur lors du chargement des données. Veuillez rafraîchir la page.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Erreur de Chargement</h3>
                <p className="text-sm text-red-700">{error}</p>
                <Button 
                  onClick={() => fetchDashboardData()} 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SFDs Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.activeSfds}</div>
                <p className="text-xs text-muted-foreground">sur {stats.totalSfds} total</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalClients.toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% ce mois
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prêts Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalLoans}</div>
                <p className="text-xs text-muted-foreground">Tous statuts</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SFDs en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.pendingSfds}</div>
                <p className="text-xs text-orange-600">Nécessite action</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Clients Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Clients (6 derniers mois)</CardTitle>
            <CardDescription>Croissance mensuelle du nombre de clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyClients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="clients" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Clients"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Prêts</CardTitle>
            <CardDescription>Distribution par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.loanStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.loanStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top SFDs Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance des Top 5 SFDs</CardTitle>
          <CardDescription>Classement par nombre de clients et prêts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.sfdPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clients" fill="hsl(var(--primary))" name="Clients" />
              <Bar dataKey="loans" fill="hsl(var(--secondary))" name="Prêts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
