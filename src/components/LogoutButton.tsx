
import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { handleRobustSignOut } from '@/utils/auth/authCleanup';
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

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Use the robust sign out function
      await handleRobustSignOut(supabase, navigate);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
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
      className={`${className} ${variant === 'destructive' ? 'text-white' : 'text-red-500'}`}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {!iconOnly && text}
    </Button>
  );
};

export default LogoutButton;
