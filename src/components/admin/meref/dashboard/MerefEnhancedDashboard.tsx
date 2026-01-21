import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, CreditCard, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Landmark, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMerefDashboardData } from '@/hooks/useMerefDashboardData';
import { useMerefSfdLoans } from '@/hooks/useMerefSfdLoans';
import { useNavigate } from 'react-router-dom';

export function MerefEnhancedDashboard() {
  const { data, isLoading, error, refetch } = useMerefDashboardData();
  const { stats: sfdLoanStats, isLoading: sfdLoansLoading } = useMerefSfdLoans();
  const navigate = useNavigate();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des données: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  const stats = data?.stats;
  const loanStatus = data?.loanStatus.filter(item => item.value > 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vue d'Ensemble</h2>
          <p className="text-muted-foreground">Statistiques globales de l'écosystème MEREF</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Total SFDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalSfds || 0}</div>
                <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  {stats?.activeSfds || 0} actifs
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{(stats?.totalClients || 0).toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Prêts Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalLoans || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Subventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalSubsidies || 0}</div>
                {(stats?.pendingSubsidies || 0) > 0 && (
                  <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    {stats?.pendingSubsidies} en attente
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* NEW: SFD Loans KPI Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Prêts aux SFD
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sfdLoansLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{sfdLoanStats?.activeLoans || 0}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Encours: {((sfdLoanStats?.totalOutstanding || 0) / 1000000).toFixed(1)}M
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => navigate('/meref/sfd-loans')}
                  >
                    Voir <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                {(sfdLoanStats?.defaultedLoans || 0) > 0 && (
                  <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    {sfdLoanStats?.defaultedLoans} en défaut
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Clients Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Clients (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.monthlyClients || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clients" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top SFDs Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 SFDs par Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.sfdPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clients" fill="hsl(var(--primary))" name="Clients" />
                  <Bar dataKey="loans" fill="hsl(var(--secondary))" name="Prêts" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loan Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Statuts de Prêts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {loanStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
