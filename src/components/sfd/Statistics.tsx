
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface StatItem {
  month: string;
  loans: number;
  clients: number;
}

export const Statistics = () => {
  const { activeSfdId } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeSfdId) return;
    
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        // Get the current date
        const currentDate = new Date();
        const months = [];
        
        // Generate the last 6 months
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
          
          const monthName = month.toLocaleDateString('fr-FR', { month: 'short' });
          const startDate = month.toISOString();
          const endDate = monthEnd.toISOString();
          
          // Count loans created in this month
          const { count: loansCount, error: loansError } = await supabase
            .from('sfd_loans')
            .select('id', { count: 'exact' })
            .eq('sfd_id', activeSfdId)
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
          if (loansError) throw loansError;
          
          // Count clients created in this month
          const { count: clientsCount, error: clientsError } = await supabase
            .from('sfd_clients')
            .select('id', { count: 'exact' })
            .eq('sfd_id', activeSfdId)
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
          if (clientsError) throw clientsError;
          
          months.push({
            month: monthName,
            loans: loansCount || 0,
            clients: clientsCount || 0
          });
        }
        
        setStats(months);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [activeSfdId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des statistiques...</span>
      </div>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Statistiques mensuelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 5, right: 30, left: 0, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  return [value, name === 'loans' ? 'Prêts' : 'Clients'];
                }}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Bar name="Prêts" dataKey="loans" fill="#0D6A51" />
              <Bar name="Clients" dataKey="clients" fill="#4AAED9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
