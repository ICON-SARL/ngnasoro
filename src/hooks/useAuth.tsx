import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any | null;
  isAdmin: boolean;
  activeSfdId: string | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user || null);
    setIsLoading(false);
    return session;
  }, []);

  useEffect(() => {
    fetchSession();

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setSession(session);
    });
  }, [fetchSession]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', user.id)
            .single();

          setIsAdmin(!!data);
          if (error) {
            console.error('Error checking admin status:', error);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Assurez-vous que activeSfdId est toujours un UUID valide
  const getValidSfdId = async () => {
    if (!user) return null;
    
    try {
      // Récupérer la première SFD disponible pour l'utilisateur
      const { data, error } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching user SFD:', error);
        return null;
      }
      
      return data?.sfd_id || null;
    } catch (e) {
      console.error('Exception when fetching user SFD:', e);
      return null;
    }
  };

  // Utilisez cette fonction dans useEffect approprié
  useEffect(() => {
    if (user && !activeSfdId) {
      getValidSfdId().then(id => {
        if (id) setActiveSfdId(id);
      });
    }
  }, [user]);

  return { user, session, isAdmin, activeSfdId, isLoading };
}
