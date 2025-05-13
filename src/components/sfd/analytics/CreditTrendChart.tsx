
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpRight, CalendarIcon, TrendingUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Demo data for credit trend analysis
const creditTrendData = [
  { month: 'Jan', disbursed: 12000000, repaid: 8000000, approved: 15000000 },
  { month: 'Feb', disbursed: 15000000, repaid: 9000000, approved: 18000000 },
  { month: 'Mar', disbursed: 18000000, repaid: 12000000, approved: 20000000 },
  { month: 'Apr', disbursed: 16000000, repaid: 14000000, approved: 17000000 },
  { month: 'Mai', disbursed: 19000000, repaid: 15000000, approved: 20000000 },
  { month: 'Jun', disbursed: 22000000, repaid: 18000000, approved: 25000000 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {(entry.value as number).toLocaleString('fr-FR')} FCFA
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export const CreditTrendChart: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('6m');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">Tendances de Crédit</CardTitle>
          <CardDescription>Analyse des montants approuvés, décaissés et remboursés</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 mois</SelectItem>
              <SelectItem value="3m">3 mois</SelectItem>
              <SelectItem value="6m">6 mois</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total décaissé</div>
            <div className="text-2xl font-bold">102 000 000 FCFA</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+8.2% </span>
              <span className="text-muted-foreground ml-1">vs {timeRange === '1m' ? 'dernier mois' : 'période précédente'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Taux de remboursement</div>
            <div className="text-2xl font-bold">94.7%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+1.3% </span>
              <span className="text-muted-foreground ml-1">vs {timeRange === '1m' ? 'dernier mois' : 'période précédente'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Demandes approuvées</div>
            <div className="text-2xl font-bold">115 000 000 FCFA</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+5.5% </span>
              <span className="text-muted-foreground ml-1">vs {timeRange === '1m' ? 'dernier mois' : 'période précédente'}</span>
            </div>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={creditTrendData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toLocaleString('fr-FR')}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approved" 
                name="Approuvé" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="disbursed" 
                name="Décaissé" 
                stroke="#0D6A51" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="repaid" 
                name="Remboursé" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center mt-6">
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            Dernière mise à jour: {format(new Date(), 'PPP', { locale: fr })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditTrendChart;
