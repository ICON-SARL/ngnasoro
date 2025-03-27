
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Shield, Users, LogOut, Building, CircleDollarSign, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const SuperAdminHeader = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-[#FFAB2E] mr-2" />
              <span className="font-bold text-xl">MEREF Admin</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <NavLink 
                to="/super-admin-dashboard" 
                className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[#FFAB2E]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/loans" 
                className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[#FFAB2E]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Prêts
              </NavLink>
              <NavLink 
                to="/clients" 
                className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[#FFAB2E]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                SFDs
              </NavLink>
              <NavLink 
                to="/transactions" 
                className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[#FFAB2E]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Transactions
              </NavLink>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'Admin'} />
                    <AvatarFallback className="bg-[#FFAB2E] text-white">
                      {user?.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/super-admin-dashboard')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Super Admin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
