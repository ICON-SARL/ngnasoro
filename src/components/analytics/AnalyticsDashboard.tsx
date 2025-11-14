import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle, Activity } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

interface AnalyticsDashboardProps {
  sfdId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sfdId }) => {
  const { activeSfdId } = useAuth();
  const targetSfdId = sfdId || activeSfdId;

  // KPIs principaux
  const { data: kpis } = useQuery({
    queryKey: ['analytics-kpis', targetSfdId],
    queryFn: async () => {
      const [clientsRes, loansRes, transactionsRes, defaultsRes] = await Promise.all([
        supabase.from('sfd_clients').select('id', { count: 'exact', head: true }).eq('sfd_id', targetSfdId!),
        supabase.from('sfd_loans').select('amount, status', { count: 'exact' }).eq('sfd_id', targetSfdId!),
        supabase.from('transactions').select('amount').eq('sfd_id', targetSfdId!),
        supabase.from('sfd_loans').select('id', { count: 'exact', head: true }).eq('sfd_id', targetSfdId!).eq('status', 'defaulted')
      ]);

      const totalLoans = loansRes.data?.reduce((sum, loan) => sum + Number(loan.amount), 0) || 0;
      const totalTransactions = transactionsRes.data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const activeLoans = loansRes.data?.filter(l => l.status === 'active').length || 0;

      return {
        totalClients: clientsRes.count || 0,
        activeLoans,
        totalLoansAmount: totalLoans,
        totalTransactions: totalTransactions,
        defaultRate: loansRes.count ? ((defaultsRes.count || 0) / loansRes.count * 100).toFixed(1) : '0'
      };
    },
    enabled: !!targetSfdId
  });

  // Évolution mensuelle des prêts
  const { data: loansEvolution } = useQuery({
    queryKey: ['analytics-loans-evolution', targetSfdId],
    queryFn: async () => {
      const { data } = await supabase
        .from('sfd_loans')
        .select('created_at, amount, status')
        .eq('sfd_id', targetSfdId!)
        .order('created_at', { ascending: true });

      const monthlyData = data?.reduce((acc: any, loan) => {
        const month = new Date(loan.created_at!).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, amount: 0, count: 0 };
        }
        acc[month].amount += Number(loan.amount);
        acc[month].count += 1;
        return acc;
      }, {});

      return Object.values(monthlyData || {});
    },
    enabled: !!targetSfdId
  });

  // Distribution des prêts par statut
  const { data: loansByStatus } = useQuery({
    queryKey: ['analytics-loans-status', targetSfdId],
    queryFn: async () => {
      const { data } = await supabase
        .from('sfd_loans')
        .select('status')
        .eq('sfd_id', targetSfdId!);

      const statusCount = data?.reduce((acc: any, loan) => {
        acc[loan.status] = (acc[loan.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCount || {}).map(([name, value]) => ({
        name: name === 'active' ? 'Actif' : name === 'completed' ? 'Complété' : name === 'pending' ? 'En attente' : name === 'defaulted' ? 'Défaut' : 'Rejeté',
        value
      }));
    },
    enabled: !!targetSfdId
  });

  // Transactions par méthode de paiement
  const { data: transactionsByMethod } = useQuery({
    queryKey: ['analytics-transactions-method', targetSfdId],
    queryFn: async () => {
      const { data } = await supabase
        .from('transactions')
        .select('payment_method, amount')
        .eq('sfd_id', targetSfdId!);

      const methodData = data?.reduce((acc: any, tx) => {
        const method = tx.payment_method || 'unknown';
        if (!acc[method]) {
          acc[method] = { method, amount: 0, count: 0 };
        }
        acc[method].amount += Number(tx.amount);
        acc[method].count += 1;
        return acc;
      }, {});

      return Object.values(methodData || {});
    },
    enabled: !!targetSfdId
  });

  const StatCard = ({ title, value, icon: Icon, trend, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 text-xs text-success mt-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Vue d'ensemble des performances et tendances</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clients Actifs"
          value={kpis?.totalClients.toLocaleString() || '0'}
          icon={Users}
          description="Total de clients enregistrés"
        />
        <StatCard
          title="Prêts Actifs"
          value={kpis?.activeLoans || '0'}
          icon={Activity}
          description="Prêts en cours de remboursement"
        />
        <StatCard
          title="Volume Total"
          value={`${(kpis?.totalLoansAmount || 0).toLocaleString()} FCFA`}
          icon={DollarSign}
          description="Montant total décaissé"
        />
        <StatCard
          title="Taux de Défaut"
          value={`${kpis?.defaultRate}%`}
          icon={AlertCircle}
          description="Prêts en situation de défaut"
        />
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Prêts</CardTitle>
              <CardDescription>Montants et nombre de prêts par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={loansEvolution as any}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAmount)" name="Montant (FCFA)" />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" name="Nombre" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribution par Statut</CardTitle>
                <CardDescription>Répartition des prêts selon leur état</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loansByStatus as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {loansByStatus?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prêts par Statut</CardTitle>
                <CardDescription>Nombre de prêts dans chaque catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loansByStatus as any}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions par Méthode</CardTitle>
              <CardDescription>Volume et nombre par mode de paiement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={transactionsByMethod as any}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="amount" fill="hsl(var(--primary))" name="Montant (FCFA)" />
                  <Bar yAxisId="right" dataKey="count" fill="hsl(var(--secondary))" name="Nombre" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;