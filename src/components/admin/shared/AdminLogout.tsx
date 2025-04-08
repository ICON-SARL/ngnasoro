
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminLogoutProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const AdminLogout: React.FC<AdminLogoutProps> = ({ 
  variant = 'ghost', 
  size = 'sm',
  className = ''
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("AdminLogout - Déconnexion initiée");
      
      // Clear all local storage items that might persist session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Call Supabase auth signOut method directly
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("AdminLogout - Error during sign out:", error);
        throw error;
      }
      
      console.log("AdminLogout - Déconnexion réussie");
      
      // Show success toast
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Force a complete page reload to reset all state
      window.location.replace('/auth');
      
    } catch (error: any) {
      console.error('AdminLogout - Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleLogout}
      className={`${className} text-white hover:text-white hover:bg-primary-foreground/10`}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
};

export default AdminLogout;
