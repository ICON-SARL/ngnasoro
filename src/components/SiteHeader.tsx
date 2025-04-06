
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SiteHeader: React.FC = () => {
  const { signOut, user } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-[#0D6A51] flex items-center justify-center text-white font-medium">M</div>
            <span className="font-semibold text-gray-800">MEREF-SFD</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-[#0D6A51] transition-colors">Accueil</Link>
          <Link to="/sfd-clients" className="text-gray-600 hover:text-[#0D6A51] transition-colors">Clients</Link>
          <Link to="/sfd-loans" className="text-gray-600 hover:text-[#0D6A51] transition-colors">Prêts</Link>
          <Link to="/sfd-subsidy-requests" className="text-gray-600 hover:text-[#0D6A51] transition-colors">Subventions</Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <span>Menu</span>
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/">Accueil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/sfd-clients">Clients</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/sfd-loans">Prêts</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/sfd/auth" className="inline-flex h-9 px-4 py-2 rounded-md bg-[#0D6A51] text-white text-sm font-medium hover:bg-[#0D6A51]/90 transition-colors">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
