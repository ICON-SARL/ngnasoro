import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Building, Users, ArrowUpRight, CircleDollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardWidgets = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        // Récupérer le nombre de SFDs actives - assurons-nous que le statut est 'active'
        const { count: activeSfdsCount, error: sfdError } = await supabase
          .from('sfds')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (sfdError) {
          console.error('Error fetching active SFDs count:', sfdError);
          throw sfdError;
        }

        // Récupérer le nombre d'administrateurs
        const { count: adminsCount, error: adminsError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin');

        if (adminsError) {
          console.error('Error fetching admins count:', adminsError);
          throw adminsError;
        }

        // Récupérer le nombre total d'utilisateurs
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('Error fetching users count:', usersError);
          throw usersError;
        }

        // Récupérer le montant total des subventions
        const { data: subsidies, error: subsidiesError } = await supabase
          .from('sfd_subsidies')
          .select('amount')
          .eq('status', 'active');

        if (subsidiesError) {
          console.error('Error fetching subsidies:', subsidiesError);
          throw subsidiesError;
        }

        const totalSubsidies = subsidies?.reduce((sum, subsidy) => sum + Number(subsidy.amount), 0) || 0;

        console.log('Dashboard stats loaded:', { 
          activeSfds: activeSfdsCount || 0,
          admins: adminsCount || 0,
          totalUsers: usersCount || 0,
          totalSubsidies
        });
        
        return {
          activeSfds: activeSfdsCount || 0,
          admins: adminsCount || 0,
          totalUsers: usersCount || 0,
          totalSubsidies
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          activeSfds: 0,
          admins: 0,
          totalUsers: 0,
          totalSubsidies: 0
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchOnWindowFocus: true
  });

  const formatCurrency = (amount: number) => {
    return amount > 0 ? `${(amount / 1000000).toFixed(1)}M FCFA` : '0M FCFA';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-gray-500">SFDs Actives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {stats?.activeSfds || 0}
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <Building className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+{stats?.activeSfds ? Math.max(0, stats.activeSfds - 0) : 0} ce mois</span>
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
              {stats?.admins || 0}
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+0 ce mois</span>
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
              {stats?.totalUsers.toLocaleString('fr-FR') || 0}
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+0 ce mois</span>
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
              {formatCurrency(stats?.totalSubsidies || 0)}
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <CircleDollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            <span>+0M ce mois</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
