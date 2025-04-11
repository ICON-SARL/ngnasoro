
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Building, Users, ArrowUpRight, CircleDollarSign } from 'lucide-react';
import { DashboardStats } from '@/hooks/useAdminDashboardData';

interface DashboardWidgetsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  stats,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-gray-500">SFDs Actives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : stats.activeSfds}
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <Building className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats.newSfdsThisMonth || 0} ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-gray-500">Administrateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : stats.admins}
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats.newAdminsThisMonth || 0} ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-gray-500">Utilisateurs Totaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : stats.totalUsers.toLocaleString('fr-FR')}
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{isLoading ? "..." : stats.newUsersThisMonth.toLocaleString('fr-FR')} ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-gray-500">Subventions Allouées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : `${(stats.totalUsers > 0 ? 1.0 : 0.0)}M FCFA`}
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <CircleDollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+0.0M ce mois</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
