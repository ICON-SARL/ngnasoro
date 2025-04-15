
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeSfdId, setActiveSfdIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.info('Initializing auth context...');
      setIsLoading(true);
      
      // Récupérer l'utilisateur actuel
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      
      // Récupérer le SFD ID depuis le localStorage
      const storedSfdId = localStorage.getItem('activeSfdId');
      if (storedSfdId && storedSfdId.trim() !== '') {
        setActiveSfdIdState(storedSfdId);
      }
      
      // Configurer les écouteurs d'événements d'authentification
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.info(`Auth state change event: ${event}`);
          setUser(session?.user ?? null);
          
          // Log le rôle utilisateur
          if (session?.user) {
            const role = session.user.app_metadata.role || 'user';
            console.info(`Auth state changed - User role: ${role}`);
          }
        }
      );
      
      setIsLoading(false);
      
      // Nettoyer les écouteurs
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);
  
  // Fonction pour définir l'ID SFD actif
  const setActiveSfdId = (id: string | null) => {
    // Ensure we don't set empty strings as SFD IDs
    if (id && id.trim() === '') {
      console.warn('Attempted to set an empty SFD ID, ignoring this operation');
      return;
    }
    
    setActiveSfdIdState(id);
    
    // Stocker dans le localStorage si non null, sinon supprimer
    if (id) {
      localStorage.setItem('activeSfdId', id);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  };
  
  // Fonction de déconnexion
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveSfdId(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        activeSfdId,
        setActiveSfdId,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
