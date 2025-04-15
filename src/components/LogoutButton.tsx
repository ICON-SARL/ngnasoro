
import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  text?: string;
  iconOnly?: boolean;
  redirectPath?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = '',
  text = 'Déconnexion',
  iconOnly = false,
  redirectPath = '/auth'
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    // Empêcher la propagation de l'événement pour éviter les conflits avec les menus déroulants
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Approche directe avec Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("LogoutButton - Error during direct signOut:", error);
        throw error;
      }
      
      console.log("LogoutButton - Direct SignOut successful");
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force a full page reload to clear any remaining state
      console.log("LogoutButton - Redirecting to", redirectPath);
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsLoggingOut(false);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`${className} ${variant === 'destructive' ? 'text-white' : ''}`}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin mr-2" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {!iconOnly && text}
    </Button>
  );
};

export default LogoutButton;
