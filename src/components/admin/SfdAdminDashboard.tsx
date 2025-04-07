
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, Bell, Settings, ChevronDown, FileText, CircleDollarSign, Users, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthOperations } from '@/hooks/auth/authOperations';
import { cn } from '@/lib/utils';

export function SfdAdminDashboard() {
  const { user } = useAuth();
  const { signOut } = useAuthOperations();
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-[#0D6A51]">
            <span>SFD-APP</span>
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/dashboard">Tableau de bord</NavLink>
            <NavLink to="/sfd/clients">Clients</NavLink>
            <NavLink to="/sfd/loans">Prêts</NavLink>
            <NavLink to="/sfd/subsidies">Prêts MEREF</NavLink>
            <NavLink to="/sfd/reports">Rapports</NavLink>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:block relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-8 pr-4 py-1.5 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-[#0D6A51]" 
            />
          </div>
          
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#0D6A51]/10 flex items-center justify-center">
                  <span className="font-medium text-[#0D6A51]">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500">Admin SFD</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ to, children, className }: NavLinkProps) {
  return (
    <Link 
      to={to} 
      className={cn(
        "text-gray-600 hover:text-[#0D6A51] px-1 py-2 text-sm font-medium",
        className
      )}
    >
      {children}
    </Link>
  );
}
