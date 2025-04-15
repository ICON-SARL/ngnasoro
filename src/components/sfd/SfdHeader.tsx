
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt, 
  Settings,
  UserPlus,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

export const SfdHeader: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth(); // Changed from logout to signOut
  const { activeSfdId, sfdData } = useSfdDataAccess();
  
  // Find the active SFD from sfdData using activeSfdId
  const activeSfd = sfdData.find(sfd => sfd.id === activeSfdId);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { name: 'Tableau de Bord', path: '/agency-dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { name: 'Prêts', path: '/sfd-loans', icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { name: 'Clients', path: '/sfd-clients', icon: <Users className="h-4 w-4 mr-2" /> },
    { name: 'Demandes d\'adhésion', path: '/sfd-adhesion-requests', icon: <UserPlus className="h-4 w-4 mr-2" /> },
    { name: 'Transactions', path: '/transactions', icon: <Receipt className="h-4 w-4 mr-2" /> },
    { name: 'Demandes de Subvention', path: '/sfd-subsidy-request', icon: <Landmark className="h-4 w-4 mr-2" /> },
    { name: 'Paramètres', path: '/sfd-settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/agency-dashboard" className="flex items-center mr-10">
              <div className="bg-[#0D6A51] text-white h-10 w-10 rounded-md flex items-center justify-center mr-2">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">SFD</span>
                <h1 className="text-xl font-bold">Portal</h1>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`px-3 py-2 text-sm ${isActive(item.path) ? 'bg-[#0D6A51]' : ''}`}
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            {activeSfd && (
              <div className="mr-4 text-right hidden md:block">
                <p className="text-sm font-medium">{activeSfd.name}</p>
                <p className="text-xs text-gray-500">{activeSfd.code}</p>
              </div>
            )}
            
            <Avatar>
              <AvatarFallback className="bg-[#0D6A51] text-white">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};
