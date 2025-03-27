
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart as PieChartIcon, BarChart as BarChartIcon, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSubsidiesByRegion } from '@/hooks/useSubsidiesByRegion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

export const DashboardCharts = () => {
  const [viewType, setViewType] = useState<'region' | 'type'>('region');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const { data, isLoading, error } = useSubsidiesByRegion();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement des données...</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Erreur de chargement</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Une erreur est survenue lors du chargement des données analytiques.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const formatMoney = (value: number) => 
    `${(value / 1000000).toFixed(1)}M FCFA`;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Analyse des Subventions</h2>
          <p className="text-sm text-muted-foreground">
            Répartition des subventions allouées
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Select 
            value={viewType} 
            onValueChange={(value) => setViewType(value as 'region' | 'type')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Grouper par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="region">Par Région</SelectItem>
              <SelectItem value="type">Par Type de SFD</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
          >
            {chartType === 'bar' ? 
              <PieChartIcon className="h-4 w-4" /> : 
              <BarChartIcon className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Subventions {viewType === 'region' ? 'par Région' : 'par Type de SFD'}
            </CardTitle>
            <CardDescription>
              Montant total des subventions allouées
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewType === 'region' ? 'region' : 'type'} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatMoney}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatMoney(value as number), 'Montant']}
                    labelFormatter={(label) => `${viewType === 'region' ? 'Région' : 'Type'}: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    name="Montant" 
                    fill="#0D6A51" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey={viewType === 'region' ? 'region' : 'type'}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatMoney(value as number), 'Montant']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Fonds</CardTitle>
            <CardDescription>
              Répartition des subventions par catégorie de SFD
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Micro-Finance', value: 45 },
                    { name: 'Coopératives', value: 30 },
                    { name: 'Caisses Rurales', value: 25 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                  <Cell fill="#FFBB28" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Temporelle</CardTitle>
            <CardDescription>
              Évolution des allocations sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: 'Jan', amount: 12000000 },
                  { month: 'Fév', amount: 15000000 },
                  { month: 'Mar', amount: 18000000 },
                  { month: 'Avr', amount: 16000000 },
                  { month: 'Mai', amount: 21000000 },
                  { month: 'Juin', amount: 25000000 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatMoney} />
                <Tooltip 
                  formatter={(value) => [formatMoney(value as number), 'Montant']}
                />
                <Bar dataKey="amount" name="Montant" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
