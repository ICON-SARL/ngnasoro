
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Users, Building2, ShieldCheck } from 'lucide-react';

export interface DashboardStats {
  totalSfds: number;
  activeSfds: number;
  pendingSfds: number;
  inactiveSfds: number;
  newSfdsThisMonth: number;
  admins: number;
  sfdAdmins: number;
  newAdminsThisMonth: number;
  totalUsers: number;
  newUsersThisMonth: number;
  pendingSubsidies: number;
  // Add other required properties
}

interface DashboardWidgetsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export const DashboardWidgets = ({ stats, isLoading = false }: DashboardWidgetsProps) => {
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-3">Loading stats...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">SFDs</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSfds}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newSfdsThisMonth} nouveaux ce mois
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.admins}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newAdminsThisMonth} nouveaux ce mois
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newUsersThisMonth} nouveaux ce mois
          </p>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded">
            <div 
              className="h-1 bg-primary rounded"
              style={{ width: `${(stats.totalUsers / 1000) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {Math.round((stats.totalUsers / 1000) * 100)}% de l'objectif de 1000
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWidgets;
