
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@/components/UserButton';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Shield, 
  FileText, 
  Settings 
} from 'lucide-react';

export function SfdHeader() {
  const location = useLocation();
  const { activeSfdId } = useAuth();

  const navigation = [
    { href: '/sfd/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: '/sfd/credits', label: 'Crédits', icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { href: '/sfd/clients', label: 'Clients', icon: <Users className="h-4 w-4 mr-2" /> },
    { href: '/sfd/role-management', label: 'Rôles', icon: <Shield className="h-4 w-4 mr-2" /> },
    { href: '/sfd/rapports', label: 'Rapports', icon: <FileText className="h-4 w-4 mr-2" /> },
    { href: '/sfd/fonctions-avancees', label: 'Fonctions Avancées', icon: <Settings className="h-4 w-4 mr-2" /> }
  ];

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/sfd/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-primary">SFD Portal</span>
            </Link>
          </div>
          
          <nav className="ml-10 flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
