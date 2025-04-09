
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ClientActivity {
  date: string;
  count: number;
}

interface ClientActivityChartProps {
  sfdId: string;
}

export function ClientActivityChart({ sfdId }: ClientActivityChartProps) {
  const [data, setData] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClientActivity = async () => {
      if (!sfdId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get client creation data for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const { data: clients, error } = await supabase
          .from('sfd_clients')
          .select('created_at')
          .eq('sfd_id', sfdId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (error) throw error;

        // Generate day-by-day aggregation
        const activityMap: Record<string, number> = {};
        
        // Initialize all days with zero count
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          activityMap[dateStr] = 0;
        }

        // Count clients per day
        clients?.forEach(client => {
          const dateStr = client.created_at.split('T')[0];
          if (activityMap[dateStr] !== undefined) {
            activityMap[dateStr] += 1;
          }
        });

        // Convert to array for chart
        const chartData = Object.entries(activityMap)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching client activity:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientActivity();
  }, [sfdId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.getDate() + '/' + (date.getMonth() + 1);
              }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} clients`, 'Nouveaux clients']} 
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('fr-FR');
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#0D6A51" 
              fill="#0D6A51" 
              fillOpacity={0.3} 
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center items-center h-full text-muted-foreground">
          Aucune donnée d'activité disponible
        </div>
      )}
    </div>
  );
}
