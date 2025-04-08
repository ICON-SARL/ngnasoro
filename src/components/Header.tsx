
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobileNavigation from './MobileNavigation';
import AdminLogout from './admin/shared/AdminLogout';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is a mobile flow page
  const isMobileFlowPage = location.pathname.includes('/mobile-flow');
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <a href="/#features" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Avantages
          </a>
          <a href="/#services" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Services
          </a>
          <a href="/#partners" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Partenaires
          </a>
          <Link to="/sfd-selector" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            SFDs
          </Link>
          <Link to="/mobile-flow" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            App Mobile
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
                  <DropdownMenuItem onClick={() => navigate('/super-admin-dashboard')}>
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <AdminLogout variant="link" size="sm" className="w-full text-left justify-start p-0 h-auto hover:bg-transparent text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </AdminLogout>
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

      {/* Mobile Navigation in Header for Tablet */}
      {isMobileFlowPage && (
        <div className="hidden sm:block md:hidden">
          <MobileNavigation isHeader={true} className="mt-2" />
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 p-4 shadow-md">
          <nav className="flex flex-col space-y-4">
            <a href="/#features" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              Avantages
            </a>
            <a href="/#services" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              Services
            </a>
            <a href="/#partners" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              Partenaires
            </a>
            <Link to="/sfd-selector" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              SFDs
            </Link>
            <Link to="/mobile-flow" className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1">
              App Mobile
            </Link>
            {!user && (
              <Link to="/auth" className="text-sm font-medium bg-[#FFAB2E] text-white px-4 py-2 rounded-md hover:bg-[#FFAB2E]/90 transition-colors">
                Connexion
              </Link>
            )}
            {user && (
              <AdminLogout variant="link" size="default" className="text-sm font-medium text-red-600 hover:text-red-700 px-2 py-1">
                Déconnexion
              </AdminLogout>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
