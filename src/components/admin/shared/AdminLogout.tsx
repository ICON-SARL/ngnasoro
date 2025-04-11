
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
      // Notification de début de déconnexion
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Clear any client-side states or cookies before calling sign out
      localStorage.removeItem('adminLastSeen');
      localStorage.removeItem('sb-xnqysvnychmsockivqhb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Call Supabase auth signOut method
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Show success toast
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Redirect to login page - Force a full page reload to clear any remaining state
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
