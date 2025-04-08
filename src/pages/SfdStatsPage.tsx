
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card } from '@/components/ui/card';
import { useSfdStats } from '@/hooks/useSfdStats';

const SfdStatsPage: React.FC = () => {
  const { stats, isLoading } = useSfdStats();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Statistics and Reports</h1>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Sample stat cards */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-500">Total Clients</h3>
              <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-medium text-gray-500">Active Loans</h3>
              <p className="text-2xl font-bold">{stats?.activeLoans || 0}</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-medium text-gray-500">Loan Disbursement</h3>
              <p className="text-2xl font-bold">{stats?.totalDisbursed ? `${stats.totalDisbursed.toLocaleString()} FCFA` : '0 FCFA'}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SfdStatsPage;
