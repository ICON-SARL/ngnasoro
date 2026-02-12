import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Building2,
  Users,
  ScrollText,
  Activity,
  Settings,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/support-admin-dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/support-admin-dashboard/users', icon: Search, label: 'Recherche Utilisateurs' },
  { to: '/support-admin-dashboard/system', icon: Activity, label: 'Santé Système' },
  { to: '/support-admin-dashboard/logs', icon: ScrollText, label: 'Logs en Temps Réel' },
];

const quickLinks = [
  { to: '/super-admin-dashboard', icon: Shield, label: 'Vue MEREF' },
  { to: '/agency-dashboard', icon: Building2, label: 'Vue SFD' },
  { to: '/meref/management/users', icon: Users, label: 'Gestion Utilisateurs' },
  { to: '/meref/system/settings', icon: Settings, label: 'Paramètres Système' },
];

const SupportAdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground">Support Admin</h2>
            <p className="text-xs text-muted-foreground">Super Hyper Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Support</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-destructive/10 text-destructive font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Accès Rapide</p>
          {quickLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default SupportAdminSidebar;
