
import React from 'react';
import { Building, UserPlus, Users, Coins, FileText, BarChart } from 'lucide-react';
import { useSfdManagementStats } from '@/hooks/useSfdManagementStats';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent } from '@/components/ui/card';

export const SfdManagementStats = () => {
  const { data: sfdStats, isLoading: sfdStatsLoading } = useSfdManagementStats();
  const { stats: dashboardStats, isLoading: dashboardLoading } = useDashboardStats();
  
  const isLoading = sfdStatsLoading || dashboardLoading;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border rounded-lg bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Building className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium">SFDs Actives</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-700">{sfdStats?.activeSfds || 0}</div>
              <p className="text-sm text-blue-600 mt-1">+{sfdStats?.newSfdsThisMonth || 0} ce mois-ci</p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border rounded-lg bg-green-50 border-green-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <UserPlus className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-medium">Administrateurs SFD</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold text-green-700">{sfdStats?.adminCount || 0}</div>
              <p className="text-sm text-green-600 mt-1">+{sfdStats?.newAdminsThisMonth || 0} ce mois-ci</p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border rounded-lg bg-purple-50 border-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-medium">Utilisateurs Totaux</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-700">{dashboardStats?.totalUsers || 0}</div>
              <p className="text-sm text-purple-600 mt-1">+{dashboardStats?.newUsersThisMonth || 0} ce mois-ci</p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border rounded-lg bg-amber-50 border-amber-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Coins className="h-5 w-5 text-amber-600 mr-2" />
            <h3 className="font-medium">Subventions Allouées</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold text-amber-700">
                {(dashboardStats?.totalUsers > 0 ? 1.0 : 0.0)}M FCFA
              </div>
              <p className="text-sm text-amber-600 mt-1">
                +{dashboardStats?.newSubsidiesThisMonth || '0.0M'} ce mois-ci
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
