
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      // Notification de début de déconnexion
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Use the signOut method from the auth context
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      // Show success toast
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Force a full page reload to clear any remaining state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Logout error:', error);
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
