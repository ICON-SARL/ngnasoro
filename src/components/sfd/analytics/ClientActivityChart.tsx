
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader } from '@/components/ui/loader';

interface ClientActivityChartProps {
  sfdId: string | null;
}

export const ClientActivityChart: React.FC<ClientActivityChartProps> = ({ sfdId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['client-activity', sfdId],
    queryFn: async () => {
      if (!sfdId) return [];
      
      // In a real app, this would be fetching actual client activity data
      // For now, we'll generate sample data based on the current date
      const today = new Date();
      const data = [];
      
      // Create data for the last 30 days
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Generate some random numbers that look plausible
        const newClients = Math.floor(Math.random() * 5); // 0-5 new clients per day
        const activeClients = Math.floor(Math.random() * 15) + 10; // 10-25 active clients
        
        data.push({
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          newClients,
          activeClients
        });
      }
      
      return data;
    },
    enabled: !!sfdId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorNewClients" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D6A51" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0D6A51" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorActiveClients" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            tickMargin={10}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => {
              return [value, name === 'newClients' ? 'Nouveaux clients' : 'Clients actifs'];
            }}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
            }}
          />
          <Area
            type="monotone"
            dataKey="newClients"
            stroke="#0D6A51"
            fillOpacity={1}
            fill="url(#colorNewClients)"
            name="Nouveaux clients"
          />
          <Area
            type="monotone"
            dataKey="activeClients"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorActiveClients)"
            name="Clients actifs"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
