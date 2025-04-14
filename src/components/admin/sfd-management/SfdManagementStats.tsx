
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building, Users, CreditCard, Landmark } from 'lucide-react';

export function SfdManagementStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['sfd-management-stats'],
    queryFn: async () => {
      try {
        // Récupérer le nombre de SFDs
        const { count: totalSfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('id', { count: 'exact', head: true });
          
        if (sfdsError) throw sfdsError;
        
        // Récupérer le nombre de clients
        const { count: totalClients, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id', { count: 'exact', head: true });
          
        if (clientsError) throw clientsError;
        
        // Récupérer le nombre de prêts
        const { count: totalLoans, error: loansError } = await supabase
          .from('sfd_loans')
          .select('id', { count: 'exact', head: true });
          
        if (loansError) throw loansError;
        
        // Récupérer le nombre de subventions
        const { count: totalSubsidies, error: subsidiesError } = await supabase
          .from('sfd_subsidies')
          .select('id', { count: 'exact', head: true });
          
        if (subsidiesError) throw subsidiesError;
        
        return {
          totalSfds: totalSfds || 0,
          totalClients: totalClients || 0,
          totalLoans: totalLoans || 0,
          totalSubsidies: totalSubsidies || 0
        };
      } catch (error) {
        console.error('Error fetching SFD stats:', error);
        return {
          totalSfds: 0,
          totalClients: 0,
          totalLoans: 0,
          totalSubsidies: 0
        };
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des SFDs</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalSfds || 0}</div>
          <p className="text-xs text-muted-foreground">
            Institutions de microfinance partenaires
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
          <p className="text-xs text-muted-foreground">
            Clients enregistrés dans toutes les SFDs
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des Prêts</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalLoans || 0}</div>
          <p className="text-xs text-muted-foreground">
            Prêts accordés par les SFDs
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subventions</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalSubsidies || 0}</div>
          <p className="text-xs text-muted-foreground">
            Subventions allouées aux SFDs
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
