
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
import { Building, CreditCard, Users, FileText, LogOut, Settings, Landmark } from 'lucide-react';
import { useAuth, getUserDisplayName } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LogoutButton from '@/components/LogoutButton';

export const AgencyHeader = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get user name from metadata or email
  const userName = getUserDisplayName(user);
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-[#0D6A51] mr-2" />
              <span className="font-bold text-xl">SFD Portal</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <NavLink 
                to="/agency-dashboard" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-[#0D6A51] ${
                    isActive ? 'text-[#0D6A51]' : 'text-muted-foreground'
                  }`
                }
              >
                Tableau de Bord
              </NavLink>
              <NavLink 
                to="/sfd-loans" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-[#0D6A51] ${
                    isActive ? 'text-[#0D6A51]' : 'text-muted-foreground'
                  }`
                }
              >
                Prêts
              </NavLink>
              <NavLink 
                to="/sfd-clients" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-[#0D6A51] ${
                    isActive ? 'text-[#0D6A51]' : 'text-muted-foreground'
                  }`
                }
              >
                Clients
              </NavLink>
              <NavLink 
                to="/sfd-transactions" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-[#0D6A51] ${
                    isActive ? 'text-[#0D6A51]' : 'text-muted-foreground'
                  }`
                }
              >
                Transactions
              </NavLink>
              <NavLink 
                to="/sfd-subsidy-requests" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-[#0D6A51] ${
                    isActive ? 'text-[#0D6A51]' : 'text-muted-foreground'
                  }`
                }
              >
                Demandes de Subvention
              </NavLink>
              <NavLink 
                to="/sfd-settings" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-[#0D6A51] ${
                    isActive ? 'text-[#0D6A51]' : 'text-muted-foreground'
                  }`
                }
              >
                Paramètres
              </NavLink>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={userName} />
                    <AvatarFallback className="bg-[#0D6A51] text-white">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'sfd@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/agency-dashboard')}>
                  <Building className="mr-2 h-4 w-4" />
                  <span>Tableau de bord</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/sfd-loans')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Prêts</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/sfd-clients')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Clients</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/sfd-transactions')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Transactions</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/sfd-subsidy-requests')}>
                  <Landmark className="mr-2 h-4 w-4" />
                  <span>Demandes de subvention</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/sfd-settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogoutButton 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto flex items-center w-full justify-start text-red-500 hover:bg-transparent" 
                    iconOnly={false} 
                    text="Se déconnecter"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
