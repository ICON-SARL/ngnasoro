import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Building2, CreditCard, AlertTriangle } from 'lucide-react';

const SupportSystemHealth = () => {
  const { data: stats } = useQuery({
    queryKey: ['support-system-health'],
    queryFn: async () => {
      const [users, sfds, loans, recentErrors] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('sfds').select('id', { count: 'exact', head: true }),
        supabase.from('sfd_loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true })
          .eq('severity', 'error')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);
      return {
        totalUsers: users.count || 0,
        totalSfds: sfds.count || 0,
        activeLoans: loans.count || 0,
        recentErrors: recentErrors.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  const cards = [
    { label: 'Utilisateurs', value: stats?.totalUsers ?? '...', icon: Users, color: 'text-primary' },
    { label: 'SFDs', value: stats?.totalSfds ?? '...', icon: Building2, color: 'text-primary' },
    { label: 'Prêts Actifs', value: stats?.activeLoans ?? '...', icon: CreditCard, color: 'text-primary' },
    { label: 'Erreurs (24h)', value: stats?.recentErrors ?? '...', icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Santé Système
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="p-4 rounded-lg border bg-card text-center">
              <card.icon className={`w-6 h-6 mx-auto mb-2 ${card.color}`} />
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportSystemHealth;
