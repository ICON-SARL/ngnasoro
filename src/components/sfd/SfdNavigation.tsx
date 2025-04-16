
import React from 'react';
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
