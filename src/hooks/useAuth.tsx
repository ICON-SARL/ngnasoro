
import { AuthProvider, useAuth as useAuthOriginal } from './auth/AuthContext';

// Réexporter le hook et le provider d'AuthContext
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Réexporter les types pour maintenir la compatibilité
export type { User, AuthContextProps, Role } from './auth/types';
export { UserRole } from './auth/types';
