
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Settings,
  PieChart,
  MessageSquare,
  BellRing
} from 'lucide-react';

const SfdNavigation = () => {
  const { userRole, isAdmin, isSfdAdmin } = useAuth();

  return (
    <nav className="space-y-2 px-2">
      <NavLink 
        to="/agency-dashboard" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <LayoutDashboard className="h-4 w-4 mr-2" />
        <span>Tableau de bord</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-clients" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <Users className="h-4 w-4 mr-2" />
        <span>Clients</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-loans" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <CreditCard className="h-4 w-4 mr-2" />
        <span>Prêts</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-subsidy-requests" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <FileText className="h-4 w-4 mr-2" />
        <span>Demandes de subvention</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-reports" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <PieChart className="h-4 w-4 mr-2" />
        <span>Rapports</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-messages" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <span>Messages</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-notifications" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <BellRing className="h-4 w-4 mr-2" />
        <span>Notifications</span>
      </NavLink>
      
      <NavLink 
        to="/sfd-settings" 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`
        }
      >
        <Settings className="h-4 w-4 mr-2" />
        <span>Paramètres</span>
      </NavLink>
    </nav>
  );
};

export default SfdNavigation;
