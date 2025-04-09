
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function SfdHeader() {
  const { user, activeSfdId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      // In a real app, we would use Supabase or another auth provider
      // await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/sfd/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-[#0D6A51] flex items-center justify-center text-white mr-2">
              <span className="font-bold">S</span>
            </div>
            <span className="font-semibold text-lg">SFD Dashboard</span>
          </Link>
          
          {activeSfdId && (
            <div className="ml-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              SFD ID: {activeSfdId.substring(0, 8)}...
            </div>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button 
            variant={isActive('/sfd/dashboard') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link to="/sfd/dashboard">
              <Home className="h-4 w-4 mr-1" />
              Tableau de bord
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/sfd/clients') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link to="/sfd/clients">
              <Users className="h-4 w-4 mr-1" />
              Clients
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/sfd/loans') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link to="/sfd/loans">
              <CreditCard className="h-4 w-4 mr-1" />
              Prêts
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/sfd/role-management') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link to="/sfd/role-management">
              <Shield className="h-4 w-4 mr-1" />
              Rôles Personnel
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/sfd/settings') ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link to="/sfd/settings">
              <Settings className="h-4 w-4 mr-1" />
              Paramètres
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Déconnexion
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <Button 
                variant={isActive('/sfd/dashboard') ? 'default' : 'ghost'} 
                size="sm" 
                asChild
                className="justify-start"
              >
                <Link to="/sfd/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Tableau de bord
                </Link>
              </Button>
              
              <Button 
                variant={isActive('/sfd/clients') ? 'default' : 'ghost'} 
                size="sm" 
                asChild
                className="justify-start"
              >
                <Link to="/sfd/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Clients
                </Link>
              </Button>
              
              <Button 
                variant={isActive('/sfd/loans') ? 'default' : 'ghost'} 
                size="sm" 
                asChild
                className="justify-start"
              >
                <Link to="/sfd/loans">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Prêts
                </Link>
              </Button>
              
              <Button 
                variant={isActive('/sfd/role-management') ? 'default' : 'ghost'} 
                size="sm" 
                asChild
                className="justify-start"
              >
                <Link to="/sfd/role-management">
                  <Shield className="h-4 w-4 mr-2" />
                  Rôles Personnel
                </Link>
              </Button>
              
              <Button 
                variant={isActive('/sfd/settings') ? 'default' : 'ghost'} 
                size="sm" 
                asChild
                className="justify-start"
              >
                <Link to="/sfd/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
