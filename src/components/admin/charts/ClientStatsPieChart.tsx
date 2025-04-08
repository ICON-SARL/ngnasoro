
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LoanStatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface ClientStatsPieChartProps {
  data: LoanStatusDistribution[];
}

export const ClientStatsPieChart: React.FC<ClientStatsPieChartProps> = ({ data }) => {
  if (!data.length) {
    return <div className="h-80 flex items-center justify-center">
      <span>Aucune donnée disponible</span>
    </div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} prêts`, '']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ClientStatsPieChart;
