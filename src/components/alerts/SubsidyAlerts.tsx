import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AmountDisplay } from '@/components/shared/AmountDisplay';

export function SubsidyAlerts() {
  const { activeSfdId, isAdmin } = useAuth();

  const { data: alerts } = useQuery({
    queryKey: ['subsidy-alerts', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data: sfd, error: sfdError } = await supabase
        .from('sfds')
        .select('id, name, subsidy_balance')
        .eq('id', activeSfdId)
        .single();

      if (sfdError) throw sfdError;

      const { data: threshold, error: thresholdError } = await supabase
        .from('subsidy_alert_thresholds')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .maybeSingle();

      // Valeurs par défaut si pas de seuil configuré
      const lowThreshold = threshold?.low_threshold || 1000000;
      const criticalThreshold = threshold?.critical_threshold || 500000;

      const alerts = [];

      if (sfd.subsidy_balance <= criticalThreshold) {
        alerts.push({
          type: 'critical',
          title: 'Solde de subvention critique',
          description: `Le solde de subvention est de ${sfd.subsidy_balance} FCFA, en dessous du seuil critique de ${criticalThreshold} FCFA.`,
          balance: sfd.subsidy_balance,
          threshold: criticalThreshold,
        });
      } else if (sfd.subsidy_balance <= lowThreshold) {
        alerts.push({
          type: 'warning',
          title: 'Solde de subvention faible',
          description: `Le solde de subvention est de ${sfd.subsidy_balance} FCFA, en dessous du seuil bas de ${lowThreshold} FCFA.`,
          balance: sfd.subsidy_balance,
          threshold: lowThreshold,
        });
      }

      return alerts;
    },
    enabled: !!activeSfdId,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === 'critical' ? 'destructive' : 'default'}
          className={alert.type === 'warning' ? 'border-orange-500 bg-orange-50' : ''}
        >
          {alert.type === 'critical' ? (
            <AlertCircle className="h-4 w-4" />
          ) : alert.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              <p className="text-sm">{alert.description}</p>
              <div className="flex items-center gap-4 text-xs mt-2">
                <span>
                  Solde actuel: <AmountDisplay amount={alert.balance} className="font-semibold" />
                </span>
                <span>
                  Seuil: <AmountDisplay amount={alert.threshold} />
                </span>
              </div>
              {isAdmin && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Action recommandée: Demander une nouvelle subvention MEREF
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
