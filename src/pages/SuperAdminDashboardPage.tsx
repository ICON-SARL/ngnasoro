
import React, { useState } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { 
  SuperAdminDashboardHeader, 
  DashboardWidgets,
  DashboardTabs, 
  DashboardCharts,
  RecentApprovals,
  SubsidySummary
} from '@/components/admin/dashboard';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';

const SuperAdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    stats, 
    subsidiesData, 
    recentApprovals, 
    isLoading 
  } = useAdminDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4 pb-20">
        <SuperAdminDashboardHeader />
        
        {activeTab === 'dashboard' && (
          <>
            <DashboardWidgets stats={stats} isLoading={isLoading} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <RecentApprovals approvals={recentApprovals} isLoading={isLoading} />
              </div>
              <div className="md:col-span-1">
                <SubsidySummary subsidiesData={subsidiesData} isLoading={isLoading} />
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'charts' && (
          <DashboardCharts />
        )}
        
        {activeTab === 'financial_reports' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Rapports financiers</h2>
            <p className="text-gray-500">Les rapports financiers sont en cours de développement.</p>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Rapports</h2>
            <p className="text-gray-500">Le système de rapports est en cours de développement.</p>
          </div>
        )}
        
        {activeTab === 'export' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Exportation des données</h2>
            <p className="text-gray-500">L'exportation des données est en cours de développement.</p>
          </div>
        )}
        
        {activeTab === 'admins' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Gestion des administrateurs</h2>
            <p className="text-gray-500">La gestion des administrateurs est en cours de développement.</p>
          </div>
        )}
        
        {activeTab === 'sfd-inspector' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Inspecteur SFD</h2>
            <p className="text-gray-500">L'outil d'inspection SFD est en cours de développement.</p>
          </div>
        )}
        
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
