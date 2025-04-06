
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  BarChart4, 
  FileText, 
  Download, 
  LayoutDashboard,
  Users,
  CreditCard
} from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />
    },
    {
      id: 'charts',
      label: 'Graphiques',
      icon: <BarChart4 className="h-4 w-4 mr-2" />
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <FileText className="h-4 w-4 mr-2" />
    },
    {
      id: 'export',
      label: 'Exportation',
      icon: <Download className="h-4 w-4 mr-2" />
    },
    {
      id: 'subsidy_requests',
      label: 'Subventions',
      icon: <CreditCard className="h-4 w-4 mr-2" />
    },
    {
      id: 'admins',
      label: 'Administrateurs',
      icon: <Users className="h-4 w-4 mr-2" />
    }
  ];
  
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 px-4">
      <div className="bg-white rounded-full shadow-md border-gray-100 border px-2 py-1.5">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                className={`rounded-full text-xs ${
                  activeTab === tab.id 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
