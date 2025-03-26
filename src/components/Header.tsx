
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ease-soft", 
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/80" : "bg-transparent"
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
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/sfd-selector" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            SFDs
          </Link>
          <Link to="/mobile-flow" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            App Mobile
          </Link>
          <Link to="/loan-system" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Microcrédits
          </Link>
          <Link to="/solvency-engine" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Financement
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <span className="sr-only">Menu utilisateur</span>
                  <div className="h-8 w-8 rounded-full bg-[#0D6A51] flex items-center justify-center text-white">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profil
                </DropdownMenuItem>
                {user.email?.endsWith('@meref-mali.ml') && (
                  <DropdownMenuItem onClick={() => navigate('/super-admin')}>
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex h-9 px-4 py-2 rounded-md bg-[#FFAB2E] text-white text-sm font-medium hover:bg-[#FFAB2E]/90 transition-colors">
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
        <div className="md:hidden bg-white dark:bg-gray-900 p-4 shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link to="/sfd-selector" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              SFDs
            </Link>
            <Link to="/mobile-flow" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              App Mobile
            </Link>
            <Link to="/loan-system" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              Microcrédits
            </Link>
            <Link to="/solvency-engine" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              Financement
            </Link>
            {!user && (
              <Link to="/auth" className="text-sm font-medium bg-[#FFAB2E] text-white px-4 py-2 rounded-md hover:bg-[#FFAB2E]/90 transition-colors">
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
