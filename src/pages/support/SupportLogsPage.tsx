import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';

const SupportLogsPage = () => {
  const { data: logs } = useQuery({
    queryKey: ['support-all-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    },
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ScrollText className="w-6 h-6" />
        Logs en Temps Réel
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Dernières 100 entrées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {logs?.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded border text-sm">
                <Badge
                  variant={log.severity === 'error' ? 'destructive' : log.severity === 'warn' ? 'secondary' : 'outline'}
                  className="text-xs min-w-[50px] justify-center"
                >
                  {log.severity}
                </Badge>
                <Badge variant="outline" className="text-xs">{log.category}</Badge>
                <span className="font-mono text-xs flex-1">{log.action}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
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

export default SupportLogsPage;
