
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SfdNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      title: 'Tableau de Bord',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/agency-dashboard',
      active: location.pathname === '/agency-dashboard'
    },
    {
      title: 'Clients',
      icon: <Users className="w-5 h-5" />,
      href: '/sfd-clients',
      active: location.pathname === '/sfd-clients'
    },
    {
      title: 'Prêts',
      icon: <CreditCard className="w-5 h-5" />,
      href: '/sfd-loans',
      active: location.pathname === '/sfd-loans'
    },
    {
      title: 'Transactions',
      icon: <DollarSign className="w-5 h-5" />,
      href: '/sfd-transactions',
      active: location.pathname === '/sfd-transactions'
    },
    {
      title: 'Demandes d\'Adhésion',
      icon: <FileText className="w-5 h-5" />,
      href: '/sfd-adhesion-requests',
      active: location.pathname === '/sfd-adhesion-requests'
    }
  ];

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
