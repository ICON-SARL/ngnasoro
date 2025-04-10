
// Re-export the useAuth hook and types from the new auth system
import { useAuth } from '@/hooks/auth/AuthContext';
export { useAuth };
export type { User } from '@/hooks/auth/types';
