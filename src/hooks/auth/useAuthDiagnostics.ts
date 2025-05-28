
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AuthDiagnostics {
  hasSession: boolean;
  hasUser: boolean;
  userRoles: string[];
  userMetadata: any;
  databaseRole: string | null;
  issues: string[];
  recommendations: string[];
}

export const useAuthDiagnostics = () => {
  const { user, session, userRole, loading } = useAuth();
  const [diagnostics, setDiagnostics] = useState<AuthDiagnostics | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    if (!user || loading) return;
    
    setIsRunning(true);
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Vérifier les rôles dans la base de données
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const databaseRoles = roleData?.map(r => r.role) || [];
      const databaseRole = databaseRoles.length > 0 ? databaseRoles[0] : null;

      // Analyser les problèmes potentiels
      if (!session) {
        issues.push('Session manquante');
        recommendations.push('Veuillez vous reconnecter');
      }

      if (databaseRoles.length === 0) {
        issues.push('Aucun rôle trouvé dans la base de données');
        recommendations.push('Contactez un administrateur pour assigner un rôle');
      }

      if (databaseRoles.length > 1) {
        issues.push(`Plusieurs rôles trouvés: ${databaseRoles.join(', ')}`);
        recommendations.push('Les rôles en doublon seront nettoyés automatiquement');
      }

      if (user.app_metadata?.role !== userRole) {
        issues.push('Métadonnées utilisateur non synchronisées');
        recommendations.push('Les métadonnées seront synchronisées automatiquement');
      }

      if (roleError) {
        issues.push(`Erreur lors de la récupération des rôles: ${roleError.message}`);
        recommendations.push('Vérifiez votre connexion et réessayez');
      }

      setDiagnostics({
        hasSession: !!session,
        hasUser: !!user,
        userRoles: databaseRoles,
        userMetadata: user.app_metadata,
        databaseRole,
        issues,
        recommendations
      });

    } catch (error) {
      console.error('Error running auth diagnostics:', error);
      issues.push(`Erreur de diagnostic: ${error}`);
      recommendations.push('Contactez le support technique');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      runDiagnostics();
    }
  }, [user, loading, userRole]);

  return {
    diagnostics,
    isRunning,
    runDiagnostics
  };
};
