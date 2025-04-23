
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, CreditCard } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export function SimplifiedMerefDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeSfds: 0,
    activeUsers: 0,
    activeCredits: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prevState => ({ ...prevState, isLoading: true }));
        const dashboardStats = await apiClient.getMerefDashboardStats(user?.id || 'system');
        setStats({
          activeSfds: dashboardStats.activeSfds,
          activeUsers: dashboardStats.activeUsers || 0,
          activeCredits: dashboardStats.pendingRequests || 0,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prevState => ({ ...prevState, isLoading: false }));
      }
    };

    fetchStats();
    
    // Mettre à jour les stats toutes les 30 secondes
    const intervalId = setInterval(fetchStats, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Agences SFD actives</CardTitle>
          <div className="flex items-center justify-between">
            {stats.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <CardDescription className="text-xl">
                {stats.activeSfds}
              </CardDescription>
            )}
            <Building className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
      </Card>
      
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</CardTitle>
          <div className="flex items-center justify-between">
            {stats.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <CardDescription className="text-xl">
                {stats.activeUsers.toLocaleString('fr-FR')}
              </CardDescription>
            )}
            <Users className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
      </Card>
      
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Demandes en attente</CardTitle>
          <div className="flex items-center justify-between">
            {stats.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <CardDescription className="text-xl">
                {stats.activeCredits}
              </CardDescription>
            )}
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
