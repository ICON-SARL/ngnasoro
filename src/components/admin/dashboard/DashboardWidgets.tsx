
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Building, Users, ArrowUpRight, CircleDollarSign } from 'lucide-react';
import { SfdSubsidy } from '@/types/sfdClients';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface DashboardWidgetsProps {
  stats: DashboardStats;
  isLoading: boolean;
  subsidies: SfdSubsidy[];
  isLoadingSubsidies: boolean;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  stats,
  isLoading,
  subsidies,
  isLoadingSubsidies
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">SFDs Actives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.activeSfds}
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <Building className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats.newSfdsThisMonth || 0} ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Administrateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.admins}
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats.newAdminsThisMonth || 0} ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Utilisateurs Totaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalUsers.toLocaleString('fr-FR')}
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats.newUsersThisMonth.toLocaleString('fr-FR')} ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Subventions Allouées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {isLoadingSubsidies 
                ? "..." 
                : `${(subsidies.reduce((sum, subsidy) => sum + subsidy.amount, 0) / 1000000).toFixed(1)}M FCFA`}
            </div>
            <div className="p-2 bg-[#0D6A51]/10 rounded-full">
              <CircleDollarSign className="h-5 w-5 text-[#0D6A51]" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats.newSubsidiesThisMonth || '15.2M'} ce mois</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
