
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { 
  DashboardWidgets, 
  SuperAdminDashboardHeader, 
  DashboardTabs,
  DashboardCharts
} from '@/components/admin/dashboard';
import { useSubsidies } from '@/hooks/useSubsidies';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { ReportGenerator } from '@/components/ReportGenerator';
import { DataExport } from '@/components/DataExport';

const SuperAdminDashboard = () => {
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  
  // Set the active tab based on query parameter
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'dashboard' });
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SuperAdminDashboardHeader />
        
        {/* Dashboard Widgets */}
        {activeTab === 'dashboard' && (
          <DashboardWidgets 
            stats={stats} 
            isLoading={isLoadingStats} 
            subsidies={subsidies} 
            isLoadingSubsidies={isLoadingSubsidies} 
          />
        )}
        
        {/* Charts */}
        {activeTab === 'charts' && (
          <DashboardCharts />
        )}
        
        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <ReportGenerator />
          </div>
        )}
        
        {/* Data Export */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <DataExport />
          </div>
        )}
        
        <DashboardTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
