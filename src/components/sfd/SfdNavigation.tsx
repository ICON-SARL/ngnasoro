
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building, CreditCard, Users, FileText, Landmark } from 'lucide-react';

export interface SfdNavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const sfdNavigationItems: SfdNavigationItem[] = [
  {
    path: "/agency-dashboard",
    label: "Tableau de bord",
    icon: <Building className="h-4 w-4 mr-2" />
  },
  {
    path: "/sfd-loans",
    label: "Prêts",
    icon: <CreditCard className="h-4 w-4 mr-2" />
  },
  {
    path: "/sfd-clients",
    label: "Clients",
    icon: <Users className="h-4 w-4 mr-2" />
  },
  {
    path: "/sfd-transactions",
    label: "Transactions",
    icon: <FileText className="h-4 w-4 mr-2" />
  },
  {
    path: "/sfd-subsidy-requests",
    label: "Subventions",
    icon: <Landmark className="h-4 w-4 mr-2" />
  }
];

export const SfdNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="flex overflow-x-auto mb-6 pb-2">
      <div className="flex space-x-1">
        {sfdNavigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              isActive(item.path) 
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
