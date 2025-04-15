
import { useAuth as useAuthFromContext } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

export function useAuth() {
  const auth = useAuthFromContext();
  
  const userRole = auth.user?.app_metadata?.role;
  
  // Ajouter des méthodes de commodité avec des vérifications plus strictes
  return {
    ...auth,
    isAdmin: userRole === 'admin' || userRole === UserRole.SuperAdmin,
    isSfdAdmin: userRole === 'sfd_admin' || userRole === UserRole.SfdAdmin,
    isClient: userRole === 'user' || userRole === 'client' || userRole === UserRole.Client,
    userRole: userRole || 'user',
    signOut: auth.signOut, // Assurez-vous que la fonction signOut est exportée
  };
}

// Re-exporter les types
export type { User, AuthContextProps };
export { UserRole };
