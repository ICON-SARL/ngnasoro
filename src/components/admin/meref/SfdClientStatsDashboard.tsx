
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SfdClientStatsDashboardProps {
  data: any[];
}

type PeriodFilter = "last-7-days" | "last-30-days" | "last-90-days" | "this-year";

export const SfdClientStatsDashboard: React.FC<SfdClientStatsDashboardProps> = ({ data }) => {
  // Fix the type by using a valid value from the enum
  const [period, setPeriod] = useState<PeriodFilter>("last-30-days");

  // Simple handler to update period
  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Statistiques des Clients par SFD</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePeriodChange("last-7-days")}
            className={`px-3 py-1 text-sm rounded ${period === "last-7-days" ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            7 jours
          </button>
          <button 
            onClick={() => handlePeriodChange("last-30-days")}
            className={`px-3 py-1 text-sm rounded ${period === "last-30-days" ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            30 jours
          </button>
          <button 
            onClick={() => handlePeriodChange("last-90-days")}
            className={`px-3 py-1 text-sm rounded ${period === "last-90-days" ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            90 jours
          </button>
          <button 
            onClick={() => handlePeriodChange("this-year")}
            className={`px-3 py-1 text-sm rounded ${period === "this-year" ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            Cette année
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="activeClients" name="Clients Actifs" fill="#22c55e" />
          <Bar dataKey="inactiveClients" name="Clients Inactifs" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Add a default export for backward compatibility
export default SfdClientStatsDashboard;
