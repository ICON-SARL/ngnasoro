import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SupportUserSearch from '@/components/support/SupportUserSearch';
import SupportSystemHealth from '@/components/support/SupportSystemHealth';
import { Shield, ScrollText, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SupportAdminDashboard = () => {
  const { data: recentLogs } = useQuery({
    queryKey: ['support-recent-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, category, severity, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    refetchInterval: 15000,
  });

  const { data: sfds } = useQuery({
    queryKey: ['support-sfds-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sfds')
        .select('id, name, code, status, region')
        .order('name');
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-destructive" />
            Support Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">Vue 360° du système N'GNA SORO!</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/super-admin-dashboard">Vue MEREF</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/agency-dashboard">Vue SFD</Link>
          </Button>
        </div>
      </div>

      <SupportSystemHealth />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupportUserSearch />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              SFDs ({sfds?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sfds?.map((sfd) => (
                <div key={sfd.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="text-sm font-medium">{sfd.name}</p>
                    <p className="text-xs text-muted-foreground">{sfd.code} • {sfd.region}</p>
                  </div>
                  <Badge variant={sfd.status === 'active' ? 'default' : 'secondary'}>
                    {sfd.status}
                  </Badge>
                </div>
              ))}
              {!sfds?.length && <p className="text-sm text-muted-foreground text-center py-4">Aucune SFD</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Derniers Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {recentLogs?.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 rounded border text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={log.severity === 'error' ? 'destructive' : log.severity === 'warn' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {log.severity}
                  </Badge>
                  <span className="font-mono text-xs">{log.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at!).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportAdminDashboard;
