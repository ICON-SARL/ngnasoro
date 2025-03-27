
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  CreditCard, 
  FileBarChart, 
  Settings,
  PieChart,
  BarChart,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white lg:sticky lg:bottom-auto lg:left-auto lg:right-auto lg:mt-6">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={onTabChange} className="lg:w-fit">
          <TabsList className="w-full h-16 lg:h-auto lg:w-auto">
            <TabsTrigger value="dashboard" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <LayoutDashboard className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Tableau de bord</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="sfds" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <Building className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">SFDs</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="subsidies" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Subventions</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="users" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <Users className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Utilisateurs</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="charts" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <BarChart className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Graphiques</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="reports" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <FileText className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Rapports</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="export" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Export</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-muted">
              <div className="flex flex-col items-center lg:flex-row lg:gap-2">
                <Settings className="h-5 w-5" />
                <span className="mt-1 text-xs font-normal lg:mt-0 lg:text-sm">Paramètres</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
