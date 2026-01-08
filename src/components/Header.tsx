import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      navigate('/auth');
      setMobileMenuOpen(false);
      
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ease-soft", 
        isScrolled ? "bg-card/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="NGNA SÔRÔ! Logo" 
            className="h-8 w-auto"
          />
          <Link to="/" className="font-medium text-lg">
            <span className="text-accent">N'GNA</span> <span className="text-primary">SÔRÔ!</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/sfd-partners" className="text-sm font-medium hover:text-primary transition-colors">
            SFDs
          </Link>
          <Link to="/faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <span className="sr-only">Menu utilisateur</span>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/mobile-flow/profile')}>
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex h-9 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
              Connexion
            </Link>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card p-4 shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link to="/sfd-partners" className="text-sm font-medium hover:text-primary transition-colors px-2 py-1">
              SFDs
            </Link>
            <Link to="/faq" className="text-sm font-medium hover:text-primary transition-colors px-2 py-1">
              FAQ
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors px-2 py-1">
              Contact
            </Link>
            {!user && (
              <Link to="/auth" className="text-sm font-medium bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors">
                Connexion
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
