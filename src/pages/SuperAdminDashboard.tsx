
import React, { useState } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdClientStatsDashboard } from '@/components/admin/meref/SfdClientStatsDashboard';
import { useAuth } from '@/hooks/useAuth';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSFD, setSelectedSFD] = useState('all');

  const mockData = {
    total_clients: 8450,
    active_clients: 7890,
    clients_with_loans: 4532,
    average_loan_amount: 125000,
    repayment_rate: 94.7,
    regions: ['Bamako', 'Sikasso', 'Segou', 'Mopti', 'Kayes'],
    sfds: [
      { id: 'sfd1', name: 'MicroFinance Plus' },
      { id: 'sfd2', name: 'Credit Rural' },
      { id: 'sfd3', name: 'Finance Populaire' },
    ],
    client_growth: [
      { month: 'Jan', count: 7200 },
      { month: 'Feb', count: 7350 },
      { month: 'Mar', count: 7500 },
      { month: 'Apr', count: 7650 },
      { month: 'May', count: 7800 },
      { month: 'Jun', count: 7950 },
      { month: 'Jul', count: 8100 },
      { month: 'Aug', count: 8250 },
      { month: 'Sep', count: 8450 },
    ],
    regional_stats: [
      { region: 'Bamako', clients: 3245, loans_volume: 456000000 },
      { region: 'Sikasso', clients: 2130, loans_volume: 289000000 },
      { region: 'Segou', clients: 1560, loans_volume: 198000000 },
      { region: 'Mopti', clients: 980, loans_volume: 112000000 },
      { region: 'Kayes', clients: 535, loans_volume: 87000000 },
    ],
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handleSFDChange = (sfd: string) => {
    setSelectedSFD(sfd);
  };

  // Pass the data prop to SfdClientStatsDashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      <div className="container mx-auto py-8 px-4">
        <SfdClientStatsDashboard 
          data={mockData}
          selectedRegion={selectedRegion}
          selectedSFD={selectedSFD}
          onRegionChange={handleRegionChange}
          onSfdChange={handleSFDChange}
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
