
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useMobilePermissions() {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has permission, show toast if not
  const checkPermissions = (permission: string): boolean => {
    if (!user) return false;
    
    const hasAccess = hasPermission(permission);
    return hasAccess;
  };
  
  // Check permission with redirect
  const checkPermissionWithRedirect = (
    permission: string, 
    redirectPath = '/mobile-flow/main',
    message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page"
  ): boolean => {
    if (!user) return false;
    
    const hasAccess = hasPermission(permission);
    if (!hasAccess) {
      toast({
        title: "Accès refusé",
        description: message,
        variant: "destructive"
      });
      navigate(redirectPath);
    }
    
    return hasAccess;
  };
  
  return {
    checkPermissions,
    checkPermissionWithRedirect
  };
}
