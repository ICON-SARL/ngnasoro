
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Shield, Building, User } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import MobileNavigation from './MobileNavigation';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    setMobileMenuOpen(false);
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
          {(!user || userRole === 'user') && (
            <>
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
            </>
          )}
          
          {userRole === 'admin' && (
            <>
              <Link to="/super-admin-dashboard" className="text-sm font-medium hover:text-amber-600 transition-colors">
                Tableau de bord
              </Link>
              <Link to="/credit-approval" className="text-sm font-medium hover:text-amber-600 transition-colors">
                Approbation de Crédit
              </Link>
              <Link to="/super-admin-dashboard?tab=sfds" className="text-sm font-medium hover:text-amber-600 transition-colors">
                Gestion SFDs
              </Link>
              <Link to="/super-admin-dashboard?tab=reports" className="text-sm font-medium hover:text-amber-600 transition-colors">
                Rapports
              </Link>
            </>
          )}
          
          {userRole === 'sfd_admin' && (
            <>
              <Link to="/agency-dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Tableau de bord
              </Link>
              <Link to="/clients" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Clients
              </Link>
              <Link to="/loans" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Crédits
              </Link>
              <Link to="/transactions" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Transactions
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
                  <span className="sr-only">Menu utilisateur</span>
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white ${
                    userRole === 'admin' ? 'bg-amber-600' : 
                    userRole === 'sfd_admin' ? 'bg-blue-600' : 'bg-[#0D6A51]'
                  }`}>
                    {userRole === 'admin' ? (
                      <Shield className="h-5 w-5" />
                    ) : userRole === 'sfd_admin' ? (
                      <Building className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.full_name || user.email}
                  {userRole === 'admin' && (
                    <span className="block text-xs text-amber-600">Super Admin MEREF</span>
                  )}
                  {userRole === 'sfd_admin' && (
                    <span className="block text-xs text-blue-600">Admin SFD</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profil
                </DropdownMenuItem>
                
                {userRole === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/super-admin-dashboard')}>
                    <Shield className="mr-2 h-4 w-4 text-amber-600" />
                    Dashboard Admin
                  </DropdownMenuItem>
                )}
                
                {userRole === 'sfd_admin' && (
                  <DropdownMenuItem onClick={() => navigate('/agency-dashboard')}>
                    <Building className="mr-2 h-4 w-4 text-blue-600" />
                    Dashboard SFD
                  </DropdownMenuItem>
                )}
                
                {userRole === 'user' && (
                  <DropdownMenuItem onClick={() => navigate('/mobile-flow')}>
                    App Mobile
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
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

      {/* Mobile Navigation in Header for Tablet */}
      {isMobileFlowPage && (
        <div className="hidden sm:block md:hidden">
          <MobileNavigation isHeader={true} className="mt-2" />
        </div>
      )}

      {/* Mobile Navigation Menu - Adapté selon le rôle */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 p-4 shadow-md">
          <nav className="flex flex-col space-y-4">
            {(!user || userRole === 'user') && (
              <>
                <Link 
                  to="/sfd-selector" 
                  className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SFDs
                </Link>
                <Link 
                  to="/mobile-flow" 
                  className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  App Mobile
                </Link>
                <Link 
                  to="/loan-system" 
                  className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Microcrédits
                </Link>
                <Link 
                  to="/solvency-engine" 
                  className="text-sm font-medium hover:text-[#0D6A51] transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Financement
                </Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Link 
                  to="/super-admin-dashboard" 
                  className="text-sm font-medium hover:text-amber-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link 
                  to="/credit-approval" 
                  className="text-sm font-medium hover:text-amber-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Approbation de Crédit
                </Link>
                <Link 
                  to="/super-admin-dashboard?tab=sfds" 
                  className="text-sm font-medium hover:text-amber-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Gestion SFDs
                </Link>
                <Link 
                  to="/super-admin-dashboard?tab=reports" 
                  className="text-sm font-medium hover:text-amber-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rapports
                </Link>
              </>
            )}
            
            {userRole === 'sfd_admin' && (
              <>
                <Link 
                  to="/agency-dashboard" 
                  className="text-sm font-medium hover:text-blue-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link 
                  to="/clients" 
                  className="text-sm font-medium hover:text-blue-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Clients
                </Link>
                <Link 
                  to="/loans" 
                  className="text-sm font-medium hover:text-blue-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crédits
                </Link>
                <Link 
                  to="/transactions" 
                  className="text-sm font-medium hover:text-blue-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
              </>
            )}
            
            {user ? (
              <Button 
                variant="destructive" 
                className="mt-2"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            ) : (
              <Link 
                to="/auth" 
                className="text-sm font-medium bg-[#FFAB2E] text-white px-4 py-2 rounded-md hover:bg-[#FFAB2E]/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
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
