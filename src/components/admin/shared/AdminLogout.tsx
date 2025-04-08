
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AdminLogoutProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const AdminLogout: React.FC<AdminLogoutProps> = ({ 
  variant = 'ghost', 
  size = 'sm',
  className = '',
  children
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log("AdminLogout - Déconnexion initiée");
      
      // Use the signOut function from Auth context to ensure consistent logout behavior
      const result = await signOut();
      
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      
      console.log("AdminLogout - Déconnexion réussie");
      
      // Show success toast
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Force a hard reload to ensure clean state
      window.location.replace('/auth');
      
    } catch (error: any) {
      setIsLoading(false);
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
      disabled={isLoading}
      className={`${className} ${variant !== 'link' ? 'text-white hover:text-white hover:bg-primary-foreground/10' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : children || <LogOut className="h-4 w-4" />}
      {!children && size !== 'icon' && !isLoading && <span className="ml-2">Déconnexion</span>}
      {!children && size !== 'icon' && isLoading && <span className="ml-2">Déconnexion en cours...</span>}
    </Button>
  );
};

export default AdminLogout;
