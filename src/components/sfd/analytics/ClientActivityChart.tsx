
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientActivityChartProps {
  sfdId?: string;
  staffRole?: string;
}

export function ClientActivityChart({ sfdId, staffRole }: ClientActivityChartProps) {
  const { canViewTransactions } = useRolePermissions();
  const hasAccess = canViewTransactions(staffRole);
  
  // Sample data for client activity chart
  const data = [
    { month: 'Jan', nouveaux: 5, actifs: 12 },
    { month: 'Fév', nouveaux: 8, actifs: 15 },
    { month: 'Mar', nouveaux: 12, actifs: 20 },
    { month: 'Avr', nouveaux: 6, actifs: 22 },
    { month: 'Mai', nouveaux: 9, actifs: 27 },
    { month: 'Juin', nouveaux: 10, actifs: 32 },
  ];
  
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité client</CardTitle>
          <CardDescription>Accès non autorisé</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour voir ce graphique.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité des clients</CardTitle>
        <CardDescription>Nouveaux clients et clients actifs par mois</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="nouveaux" name="Nouveaux clients" fill="#60A5FA" />
            <Bar dataKey="actifs" name="Clients actifs" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
