
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  BarChart, 
  FileText, 
  FileDown, 
  Users, 
  Receipt, 
  BriefcaseBusiness 
} from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="dashboard" className="flex gap-1 items-center">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline-block">Tableau de Bord</span>
          </TabsTrigger>
          
          <TabsTrigger value="charts" className="flex gap-1 items-center">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Graphiques</span>
          </TabsTrigger>
          
          <TabsTrigger value="client-stats" className="flex gap-1 items-center">
            <BriefcaseBusiness className="h-4 w-4" />
            <span className="hidden sm:inline-block">Stats Clients</span>
          </TabsTrigger>
          
          <TabsTrigger value="reports" className="flex gap-1 items-center">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline-block">Rapports</span>
          </TabsTrigger>
          
          <TabsTrigger value="financial_reports" className="flex gap-1 items-center">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline-block">Finance</span>
          </TabsTrigger>
          
          <TabsTrigger value="export" className="flex gap-1 items-center">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline-block">Export</span>
          </TabsTrigger>
          
          <TabsTrigger value="admins" className="flex gap-1 items-center">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline-block">Admins</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
