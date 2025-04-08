
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/index';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SfdHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      console.log("SfdHeader - Déconnexion initiée");
      
      // Clear all storage to remove any session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Call Supabase auth signOut method directly
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("SfdHeader - Error during sign out:", error);
        throw error;
      }
      
      console.log("SfdHeader - Déconnexion réussie");
      
      // Show success toast
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Force a complete page reload to reset all state
      window.location.replace('/auth');
      
    } catch (error) {
      console.error("SfdHeader - Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">SFD Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">
            {user?.full_name || user?.email}
          </span>
          
          <nav>
            <ul className="flex gap-4">
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={() => navigate('/sfd')}
                >
                  Dashboard
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={() => navigate('/sfd/subsidy-requests')}
                >
                  Demandes de Prêt
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={() => navigate('/sfd-loans')}
                >
                  Gestion des Prêts
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={handleSignOut}
                >
                  Déconnexion
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
