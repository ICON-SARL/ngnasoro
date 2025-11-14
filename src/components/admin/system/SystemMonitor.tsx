import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertCircle, CheckCircle, Clock, Database, Server, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const SystemMonitor: React.FC = () => {
  // Audit logs récents
  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh toutes les 30s
  });

  // Statistiques système
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const [
        totalUsers,
        totalSfds,
        totalLoans,
        totalTransactions,
        recentErrors
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('sfds').select('id', { count: 'exact', head: true }),
        supabase.from('sfd_loans').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('severity', 'error').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        users: totalUsers.count || 0,
        sfds: totalSfds.count || 0,
        loans: totalLoans.count || 0,
        transactions: totalTransactions.count || 0,
        errors24h: recentErrors.count || 0
      };
    },
    refetchInterval: 60000
  });

  // Statistiques par catégorie
  const { data: categoryStats } = useQuery({
    queryKey: ['category-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('category, severity')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const stats = data?.reduce((acc: any, log) => {
        if (!acc[log.category]) {
          acc[log.category] = { total: 0, errors: 0, warnings: 0 };
        }
        acc[log.category].total += 1;
        if (log.severity === 'error') acc[log.category].errors += 1;
        if (log.severity === 'warning') acc[log.category].warnings += 1;
        return acc;
      }, {});

      return stats;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <Zap className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Monitoring Système</h2>
        <p className="text-muted-foreground">Surveillance en temps réel des opérations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Utilisateurs"
          value={systemStats?.users || 0}
          icon={Activity}
          trend="Comptes actifs"
        />
        <StatCard
          title="SFDs"
          value={systemStats?.sfds || 0}
          icon={Server}
          trend="Structures enregistrées"
        />
        <StatCard
          title="Prêts"
          value={systemStats?.loans || 0}
          icon={Database}
          trend="Total décaissements"
        />
        <StatCard
          title="Transactions"
          value={systemStats?.transactions || 0}
          icon={Zap}
          trend="Opérations financières"
        />
        <StatCard
          title="Erreurs (24h)"
          value={systemStats?.errors24h || 0}
          icon={AlertCircle}
          trend="Incidents récents"
        />
      </div>

      {/* Tabs pour logs et stats */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs Système</TabsTrigger>
          <TabsTrigger value="categories">Par Catégorie</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs (Derniers 50)</CardTitle>
              <CardDescription>
                Événements système en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {auditLogs?.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-0.5">
                        {getSeverityIcon(log.severity)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(log.severity) as any}>
                            {log.severity}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.action}
                          </span>
                        </div>
                        {log.error_message && (
                          <p className="text-sm text-destructive">{log.error_message}</p>
                        )}
                        {log.details && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {JSON.stringify(log.details).substring(0, 100)}...
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(log.created_at!), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques par Catégorie (7 jours)</CardTitle>
              <CardDescription>
                Distribution des événements par type d'opération
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats && Object.entries(categoryStats).map(([category, stats]: any) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge variant="outline">{stats.total} événements</Badge>
                      </div>
                      <div className="flex gap-2">
                        {stats.errors > 0 && (
                          <Badge variant="destructive">{stats.errors} erreurs</Badge>
                        )}
                        {stats.warnings > 0 && (
                          <Badge variant="secondary">{stats.warnings} warnings</Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((stats.total / (systemStats?.transactions || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitor;