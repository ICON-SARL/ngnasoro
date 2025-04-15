
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard,
  Users,
  Receipt,
  UserPlus,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SfdNavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const sfdNavigationItems: SfdNavigationItem[] = [
  { 
    label: 'Prêts', 
    path: '/sfd-loans', 
    icon: <CreditCard className="h-4 w-4 mr-2" /> 
  },
  { 
    label: 'Clients', 
    path: '/sfd-clients', 
    icon: <Users className="h-4 w-4 mr-2" /> 
  },
  { 
    label: 'Demandes d\'adhésion', 
    path: '/sfd-adhesion-requests', 
    icon: <UserPlus className="h-4 w-4 mr-2" /> 
  },
  { 
    label: 'Transactions', 
    path: '/sfd-transactions', 
    icon: <Receipt className="h-4 w-4 mr-2" /> 
  },
  { 
    label: 'Demandes de Subvention', 
    path: '/sfd-subsidy-requests', 
    icon: <Landmark className="h-4 w-4 mr-2" /> 
  }
];

interface SfdNavigationProps {
  variant?: 'default' | 'horizontal' | 'vertical';
  className?: string;
}

export const SfdNavigation: React.FC<SfdNavigationProps> = ({ 
  variant = 'horizontal',
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleNavigation = (path: string) => {
    console.log(`Navigation vers: ${path}`);
    navigate(path);
  };
  
  return (
    <div className={`flex ${variant === 'vertical' ? 'flex-col' : 'flex-row'} gap-2 ${className}`}>
      {sfdNavigationItems.map((item) => (
        <Button
          key={item.path}
          variant={isActive(item.path) ? 'default' : 'outline'}
          className="flex items-center"
          onClick={() => handleNavigation(item.path)}
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      ))}
    </div>
  );
};
