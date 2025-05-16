
// Re-export from the new location to maintain backward compatibility
import { useAuth } from './useAuth';
import { User, AuthContextProps, UserRole } from './auth/types';

// Export the hook directly
export { useAuth };

// Re-export types to maintain backward compatibility
export type { User, AuthContextProps };
export { UserRole };
