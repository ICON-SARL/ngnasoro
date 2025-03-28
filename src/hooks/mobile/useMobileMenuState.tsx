
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-toast';

export function useMobileMenuState() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (!error) {
        navigate('/auth');
      } else {
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  
  return {
    menuOpen,
    toggleMenu,
    handleLogout
  };
}
