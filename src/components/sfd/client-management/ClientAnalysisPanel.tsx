
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ClientAnalyticData {
  status_counts: { [key: string]: number };
  monthly_growth: { month: string; count: number }[];
  retention_rate: number;
  average_acquisition_cost: number;
}

interface ClientAnalysisPanelProps {
  sfdId: string;
}

export function ClientAnalysisPanel({ sfdId }: ClientAnalysisPanelProps) {
  // Fetch client analytics data
  const { data, isLoading, error } = useQuery({
    queryKey: ['client-analytics', sfdId],
    queryFn: async () => {
      // This would normally call a real AI-powered analytics endpoint
      // For demo purposes, we're creating mock data
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data that would come from an AI analysis
      const mockData: ClientAnalyticData = {
        status_counts: {
          validated: 24,
          pending: 8,
          rejected: 3
        },
        monthly_growth: [
          { month: 'Jan', count: 5 },
          { month: 'Feb', count: 7 },
          { month: 'Mar', count: 10 },
          { month: 'Apr', count: 8 },
          { month: 'May', count: 12 }
        ],
        retention_rate: 87.5,
        average_acquisition_cost: 2500
      };
      
      return mockData;
    },
    enabled: !!sfdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analyse des clients</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analyse des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Impossible de charger les analyses client.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Format data for the chart
  const statusData = Object.entries(data.status_counts).map(([name, value]) => ({
    name: name === 'validated' ? 'Validés' : name === 'pending' ? 'En attente' : 'Rejetés',
    value
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Analyse IA des clients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Distribution des statuts client</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0D6A51" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Taux de rétention</p>
            <p className="text-2xl font-bold">{data.retention_rate}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Coût d'acquisition moyen</p>
            <p className="text-2xl font-bold">{data.average_acquisition_cost.toLocaleString()} FCFA</p>
          </div>
        </div>
        
        <div className="pt-2">
          <p className="text-sm font-medium mb-2">Conseils d'amélioration</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>Augmentez le taux de conversion en validant les clients plus rapidement</li>
            <li>Réduisez le temps de traitement des demandes en attente</li>
            <li>Identifiez les causes fréquentes de rejet pour améliorer le processus</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
