
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Export the navigation items so they can be reused in other components
export const sfdNavigationItems = [
  {
    title: 'Tableau de Bord',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/agency-dashboard',
    path: '/agency-dashboard',
    label: 'Tableau de Bord'
  },
  {
    title: 'Clients',
    icon: <Users className="w-5 h-5" />,
    href: '/sfd-clients',
    path: '/sfd-clients',
    label: 'Clients'
  },
  {
    title: 'Prêts',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/sfd-loans',
    path: '/sfd-loans',
    label: 'Prêts'
  },
  {
    title: 'Transactions',
    icon: <DollarSign className="w-5 h-5" />,
    href: '/sfd-transactions',
    path: '/sfd-transactions',
    label: 'Transactions'
  },
  {
    title: 'Demandes d\'Adhésion',
    icon: <FileText className="w-5 h-5" />,
    href: '/sfd-adhesion-requests',
    path: '/sfd-adhesion-requests',
    label: 'Demandes d\'Adhésion'
  }
];

export const SfdNavigation = () => {
  const location = useLocation();

  const navItems = sfdNavigationItems.map(item => ({
    ...item,
    active: location.pathname === item.href
  }));

  return (
    <nav className="flex overflow-x-auto mb-6 pb-2">
      <div className="flex space-x-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap",
              item.active 
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
