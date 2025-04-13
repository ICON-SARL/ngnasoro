
import React from 'react';
import { Building, UserPlus, FileText } from 'lucide-react';
import { useSfdManagementStats } from '@/hooks/useSfdManagementStats';
import { Skeleton } from '@/components/ui/skeleton';

export const SfdManagementStats = () => {
  const { data: stats, isLoading } = useSfdManagementStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
        <div className="flex items-center mb-2">
          <Building className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium">SFDs Actives</h3>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold text-blue-700">{stats?.activeSfds || 0}</div>
            <p className="text-sm text-blue-600 mt-1">+{stats?.newSfdsThisMonth || 0} ce mois-ci</p>
          </>
        )}
      </div>
      
      <div className="border rounded-lg p-4 bg-green-50 border-green-100">
        <div className="flex items-center mb-2">
          <UserPlus className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="font-medium">Administrateurs SFD</h3>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold text-green-700">{stats?.adminCount || 0}</div>
            <p className="text-sm text-green-600 mt-1">+{stats?.newAdminsThisMonth || 0} ce mois-ci</p>
          </>
        )}
      </div>
      
      <div className="border rounded-lg p-4 bg-amber-50 border-amber-100">
        <div className="flex items-center mb-2">
          <FileText className="h-5 w-5 text-amber-600 mr-2" />
          <h3 className="font-medium">Rapports en attente</h3>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold text-amber-700">{stats?.pendingReports || 0}</div>
            <p className="text-sm text-amber-600 mt-1">Échéance cette semaine</p>
          </>
        )}
      </div>
    </div>
  );
};
