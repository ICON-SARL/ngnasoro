
// Export the AuthProvider and useAuth hook from the AuthContext file
export { AuthProvider, useAuth } from './AuthContext';
export type { User, AuthContextProps } from './types';
// Export UserRole only once to avoid duplication
export { UserRole } from './types';
