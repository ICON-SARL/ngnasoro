
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building,
  BarChart3,
  User,
  FileText,
  DollarSign,
  Bell,
  CreditCard,
  Shield,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 hover:text-gray-900",
      active ? "bg-gray-100 text-gray-900" : "text-gray-500"
    )}
  >
    {icon}
    <span>{label}</span>
    {active && <ChevronRight className="ml-auto h-4 w-4" />}
  </Link>
);

export function AdminDashboardNav() {
  const location = useLocation();
  const pathname = location.pathname;
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="grid gap-1">
      <NavLink
        to="/super-admin-dashboard"
        icon={<BarChart3 className="h-5 w-5" />}
        label="Tableau de bord"
        active={isActive('/super-admin-dashboard')}
      />
      <NavLink
        to="/sfd-management"
        icon={<Building className="h-5 w-5" />}
        label="Gestion des SFD"
        active={isActive('/sfd-management')}
      />
      <NavLink
        to="/credit-approval"
        icon={<CreditCard className="h-5 w-5" />}
        label="Approbation de crédit"
        active={isActive('/credit-approval')}
      />
      <NavLink
        to="/super-admin-dashboard/users"
        icon={<User className="h-5 w-5" />}
        label="Utilisateurs"
        active={isActive('/super-admin-dashboard/users')}
      />
      <NavLink
        to="/super-admin-dashboard/subsidies"
        icon={<DollarSign className="h-5 w-5" />}
        label="Subventions"
        active={isActive('/super-admin-dashboard/subsidies')}
      />
      <NavLink
        to="/super-admin-dashboard/reports"
        icon={<FileText className="h-5 w-5" />}
        label="Rapports"
        active={isActive('/super-admin-dashboard/reports')}
      />
      <NavLink
        to="/audit-logs"
        icon={<Shield className="h-5 w-5" />}
        label="Logs d'audit"
        active={isActive('/audit-logs')}
      />
      <NavLink
        to="/super-admin-dashboard/notifications"
        icon={<Bell className="h-5 w-5" />}
        label="Notifications"
        active={isActive('/super-admin-dashboard/notifications')}
      />
    </nav>
  );
}
