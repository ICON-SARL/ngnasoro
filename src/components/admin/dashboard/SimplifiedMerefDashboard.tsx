
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, CreditCard } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';

export function SimplifiedMerefDashboard() {
  const [stats, setStats] = useState({
    activeSfds: 0,
    activeUsers: 0,
    activeCredits: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await apiClient.getMerefDashboardStats();
        setStats({
          activeSfds: dashboardStats.activeSfds,
          activeUsers: dashboardStats.activeUsers,
          activeCredits: dashboardStats.activeCredits,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prevState => ({ ...prevState, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="py-2">
          <CardDescription>Agences SFD actives</CardDescription>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {stats.isLoading ? '...' : stats.activeSfds}
            </CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
      </Card>
      
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="py-2">
          <CardDescription>Utilisateurs actifs</CardDescription>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {stats.isLoading ? '...' : stats.activeUsers.toLocaleString('fr-FR')}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
      </Card>
      
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="py-2">
          <CardDescription>Crédits actifs</CardDescription>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {stats.isLoading ? '...' : stats.activeCredits}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
