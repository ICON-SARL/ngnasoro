
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CreditCard, 
  Building, 
  Users, 
  Settings, 
  FileText, 
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/utils/auth/roleTypes';

export function Navigation() {
  const location = useLocation();
  const { userRole } = useAuth();
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isSfdAdmin = userRole === UserRole.SFD_ADMIN;

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/admin/sfd-management', label: 'SFDs', icon: <Building className="h-5 w-5" /> },
    { href: '/admin/role-management', label: 'Rôles', icon: <Shield className="h-5 w-5" /> },
    { href: '/admin/users-management', label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
    { href: '/admin/rapports', label: 'Rapports', icon: <FileText className="h-5 w-5" /> },
    { href: '/admin/fonctions-avancees', label: 'Fonctions Avancées', icon: <Settings className="h-5 w-5" /> },
  ];

  const sfdLinks = [
    { href: '/sfd/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/sfd/credits', label: 'Crédits', icon: <CreditCard className="h-5 w-5" /> },
    { href: '/sfd/clients', label: 'Clients', icon: <Users className="h-5 w-5" /> },
    { href: '/sfd/role-management', label: 'Rôles', icon: <Shield className="h-5 w-5" /> },
    { href: '/sfd/rapports', label: 'Rapports', icon: <FileText className="h-5 w-5" /> },
    { href: '/sfd/fonctions-avancees', label: 'Fonctions Avancées', icon: <Settings className="h-5 w-5" /> },
  ];

  const links = isAdmin ? adminLinks : isSfdAdmin ? sfdLinks : [];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 px-4 py-2 border-b">
      {links.map(link => (
        <Link
          key={link.href}
          to={link.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            location.pathname === link.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {link.icon}
          <span className="ml-2">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
