
import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { handleRobustSignOut } from '@/utils/auth/authCleanup';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Force immediate UI update to show loading state
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Use the robust sign out function
      await handleRobustSignOut(supabase);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
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
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
};

export default AdminLogout;
