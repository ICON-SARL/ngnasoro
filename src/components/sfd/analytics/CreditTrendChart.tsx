
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Download } from 'lucide-react';

// Sample data - in a real application, this would come from an API
const monthlyData = [
  { month: 'Jan', requests: 45, approved: 38, rejected: 7 },
  { month: 'Fév', requests: 52, approved: 43, rejected: 9 },
  { month: 'Mar', requests: 49, approved: 40, rejected: 9 },
  { month: 'Avr', requests: 63, approved: 55, rejected: 8 },
  { month: 'Mai', requests: 59, approved: 48, rejected: 11 },
  { month: 'Jun', requests: 68, approved: 62, rejected: 6 },
  { month: 'Jul', requests: 72, approved: 65, rejected: 7 },
  { month: 'Aoû', requests: 67, approved: 58, rejected: 9 },
  { month: 'Sep', requests: 75, approved: 68, rejected: 7 },
  { month: 'Oct', requests: 80, approved: 69, rejected: 11 },
  { month: 'Nov', requests: 92, approved: 82, rejected: 10 },
  { month: 'Dec', requests: 55, approved: 47, rejected: 8 }
];

const quarterlyData = [
  { quarter: 'Q1', requests: 146, approved: 121, rejected: 25 },
  { quarter: 'Q2', requests: 190, approved: 165, rejected: 25 },
  { quarter: 'Q3', requests: 214, approved: 191, rejected: 23 },
  { quarter: 'Q4', requests: 227, approved: 198, rejected: 29 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function CreditTrendChart() {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  
  const data = timeFrame === 'monthly' ? monthlyData : quarterlyData;
  const categoryKey = timeFrame === 'monthly' ? 'month' : 'quarter';
  
  const renderApprovalPieChart = () => {
    const totalRequests = data.reduce((sum, item) => sum + item.requests, 0);
    const totalApproved = data.reduce((sum, item) => sum + item.approved, 0);
    const totalRejected = data.reduce((sum, item) => sum + item.rejected, 0);
    
    const pieData = [
      { name: 'Approuvées', value: totalApproved },
      { name: 'Rejetées', value: totalRejected }
    ];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} demandes`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="requests" name="Demandes" fill="#8884d8" />
          <Bar dataKey="approved" name="Approuvées" fill="#82ca9d" />
          <Bar dataKey="rejected" name="Rejetées" fill="#ff8042" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="requests" name="Demandes" stroke="#8884d8" />
          <Line type="monotone" dataKey="approved" name="Approuvées" stroke="#82ca9d" />
          <Line type="monotone" dataKey="rejected" name="Rejetées" stroke="#ff8042" />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Tendances des demandes de crédit</CardTitle>
            <CardDescription>Évolution des demandes de crédit par période</CardDescription>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Select
              value={timeFrame}
              onValueChange={setTimeFrame}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="quarterly">Trimestriel</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1 border rounded-md">
              <Button
                variant={chartType === 'bar' ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setChartType('bar')}
                className="rounded-none"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setChartType('line')}
                className="rounded-none"
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setChartType('pie')}
                className="rounded-none"
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === 'bar' && renderBarChart()}
        {chartType === 'line' && renderLineChart()}
        {chartType === 'pie' && renderApprovalPieChart()}
      </CardContent>
    </Card>
  );
}
