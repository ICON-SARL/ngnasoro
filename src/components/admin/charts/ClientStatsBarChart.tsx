
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SfdClientDistribution {
  id: string;
  name: string;
  activeClients: number;
  inactiveClients: number;
}

interface ClientStatsBarChartProps {
  data: SfdClientDistribution[];
}

export const ClientStatsBarChart: React.FC<ClientStatsBarChartProps> = ({ data }) => {
  if (!data.length) {
    return <div className="h-80 flex items-center justify-center">
      <span>Aucune donnée disponible</span>
    </div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value} clients`, '']}
          labelFormatter={(label) => `SFD: ${label}`}
        />
        <Legend />
        <Bar dataKey="activeClients" name="Clients Actifs" fill="#22c55e" />
        <Bar dataKey="inactiveClients" name="Clients Inactifs" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ClientStatsBarChart;
