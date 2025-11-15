import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CheckCircle, 
  Building, 
  Users, 
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  ChevronDown,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMerefNotifications } from '@/hooks/useMerefNotifications';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MerefSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

export function MerefSidebar({ collapsed, onCollapse }: MerefSidebarProps) {
  const location = useLocation();
  const { data: notifications } = useMerefNotifications();

  const navItems: NavItem[] = [
    {
      title: 'Tableau de bord',
      href: '/super-admin-dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      title: 'Approbations',
      icon: <CheckCircle className="h-4 w-4" />,
      badge: (notifications?.pendingSfds || 0) + (notifications?.pendingCredits || 0) + (notifications?.pendingSubsidies || 0),
      children: [
        {
          title: 'SFDs',
          href: '/meref/approvals/sfds',
          icon: <Building className="h-4 w-4" />,
          badge: notifications?.pendingSfds
        },
        {
          title: 'Crédits',
          href: '/meref/approvals/credits',
          icon: <CreditCard className="h-4 w-4" />,
          badge: notifications?.pendingCredits
        },
        {
          title: 'Subventions',
          href: '/meref/approvals/subsidies',
          icon: <DollarSign className="h-4 w-4" />,
          badge: notifications?.pendingSubsidies
        },
        {
          title: 'Historique',
          href: '/meref/approvals/history',
          icon: <FileText className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Gestion',
      icon: <Shield className="h-4 w-4" />,
      children: [
        {
          title: 'SFDs',
          href: '/meref/management/sfds',
          icon: <Building className="h-4 w-4" />
        },
        {
          title: 'Administrateurs',
          href: '/meref/management/admins',
          icon: <Shield className="h-4 w-4" />
        },
        {
          title: 'Utilisateurs',
          href: '/meref/management/users',
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Supervision',
      icon: <TrendingUp className="h-4 w-4" />,
      badge: notifications?.overdueLoans,
      children: [
        {
          title: 'Prêts',
          href: '/meref/monitoring/loans',
          icon: <CreditCard className="h-4 w-4" />,
          badge: notifications?.overdueLoans
        },
        {
          title: 'Tontines',
          href: '/meref/monitoring/tontines',
          icon: <Users className="h-4 w-4" />
        },
        {
          title: 'Mobile Money',
          href: '/meref/monitoring/mobile-money',
          icon: <DollarSign className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Rapports',
      icon: <FileText className="h-4 w-4" />,
      children: [
        {
          title: 'Générer',
          href: '/meref/reports/generate',
          icon: <FileText className="h-4 w-4" />
        },
        {
          title: 'Historique',
          href: '/meref/reports/history',
          icon: <FileText className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Système',
      icon: <Settings className="h-4 w-4" />,
      children: [
        {
          title: 'Paramètres',
          href: '/meref/system/settings',
          icon: <Settings className="h-4 w-4" />
        },
        {
          title: 'Logs d\'audit',
          href: '/meref/system/logs',
          icon: <FileText className="h-4 w-4" />
        }
      ]
    }
  ];

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = item.href && location.pathname === item.href;
    const hasActiveChild = item.children?.some(child => child.href && location.pathname === child.href);
    const [isOpen, setIsOpen] = React.useState(hasActiveChild || false);

    if (item.children) {
      return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            hasActiveChild && "bg-accent text-accent-foreground",
            level > 0 && "ml-4"
          )}>
            <div className="flex items-center gap-2">
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] px-1">
                    {item.badge}
                  </Badge>
                )}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )} />
              </div>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 space-y-1">
              {item.children.map((child, idx) => (
                <NavItemComponent key={idx} item={child} level={level + 1} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        to={item.href!}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
          level > 0 && "ml-4"
        )}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          {!collapsed && <span>{item.title}</span>}
        </div>
        {!collapsed && item.badge && item.badge > 0 && (
          <Badge variant={isActive ? "secondary" : "destructive"} className="h-5 min-w-[20px] px-1">
            {item.badge}
          </Badge>
        )}
      </NavLink>
    );
  };

  return (
    <aside className={cn(
      "border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      "hidden md:block"
    )}>
      <ScrollArea className="h-full py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item, idx) => (
            <NavItemComponent key={idx} item={item} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
