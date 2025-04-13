
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, LayoutDashboard, FileText, Users, Search, PieChart } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="dashboard" className="flex gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </TabsTrigger>
          
          <TabsTrigger value="charts" className="flex gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden md:inline">Graphiques</span>
          </TabsTrigger>
          
          <TabsTrigger value="reports" className="flex gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Rapports</span>
          </TabsTrigger>
          
          <TabsTrigger value="admins" className="flex gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Administrateurs</span>
          </TabsTrigger>
          
          <TabsTrigger value="sfd-inspector" className="flex gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">SFD Inspector</span>
          </TabsTrigger>
          
          <TabsTrigger value="meref-dashboard" className="flex gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden md:inline">MEREF</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
