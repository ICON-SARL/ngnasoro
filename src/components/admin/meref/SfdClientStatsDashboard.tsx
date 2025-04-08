
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

export interface SfdClientStatsDashboardProps {
  data: {
    total_clients: number;
    active_clients: number;
    clients_with_loans: number;
    average_loan_amount: number;
    repayment_rate: number;
    regions: string[];
    sfds: { id: string; name: string }[];
    client_growth: { month: string; count: number }[];
    regional_stats: { region: string; clients: number; loans_volume: number }[];
  };
  selectedRegion: string;
  selectedSFD: string;
  onRegionChange: (region: string) => void;
  onSfdChange: (sfd: string) => void;
}

export const SfdClientStatsDashboard: React.FC<SfdClientStatsDashboardProps> = ({
  data,
  selectedRegion,
  selectedSFD,
  onRegionChange,
  onSfdChange,
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistiques des Clients SFD</h1>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Région</label>
          <Select value={selectedRegion} onValueChange={onRegionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les régions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les régions</SelectItem>
              {data.regions.map((region) => (
                <SelectItem key={region} value={region.toLowerCase()}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">SFD</label>
          <Select value={selectedSFD} onValueChange={onSfdChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les SFD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les SFD</SelectItem>
              {data.sfds.map((sfd) => (
                <SelectItem key={sfd.id} value={sfd.id}>
                  {sfd.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Clients Totaux</h3>
            <p className="text-3xl font-bold mt-1">{data.total_clients.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Clients Actifs</h3>
            <p className="text-3xl font-bold mt-1">{data.active_clients.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Clients avec Prêts</h3>
            <p className="text-3xl font-bold mt-1">{data.clients_with_loans.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Montant Moyen</h3>
            <p className="text-3xl font-bold mt-1">{data.average_loan_amount.toLocaleString()} FCFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Taux de Remboursement</h3>
            <p className="text-3xl font-bold mt-1">{data.repayment_rate}%</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different analytics */}
      <Tabs defaultValue="growth">
        <TabsList className="mb-4">
          <TabsTrigger value="growth">Croissance des Clients</TabsTrigger>
          <TabsTrigger value="regional">Statistiques Régionales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="growth">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Évolution du Nombre de Clients</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.client_growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#93C5FD" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Répartition des Clients par Région</h3>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.regional_stats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="clients"
                        nameKey="region"
                      >
                        {data.regional_stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Volume de Prêts par Région</h3>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.regional_stats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="loans_volume"
                        nameKey="region"
                      >
                        {data.regional_stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Add default export as well for compatibility
export default SfdClientStatsDashboard;
