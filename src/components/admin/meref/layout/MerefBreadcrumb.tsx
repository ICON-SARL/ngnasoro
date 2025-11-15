import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  'super-admin-dashboard': 'Tableau de bord',
  'meref': 'MEREF',
  'approvals': 'Approbations',
  'sfds': 'SFDs',
  'credits': 'Crédits',
  'subsidies': 'Subventions',
  'history': 'Historique',
  'management': 'Gestion',
  'admins': 'Administrateurs',
  'users': 'Utilisateurs',
  'monitoring': 'Supervision',
  'loans': 'Prêts',
  'tontines': 'Tontines',
  'mobile-money': 'Mobile Money',
  'reports': 'Rapports',
  'generate': 'Générer',
  'system': 'Système',
  'settings': 'Paramètres',
  'logs': 'Logs d\'audit'
};

export function MerefBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[segment] || segment;
    return { path, name };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/super-admin-dashboard">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
