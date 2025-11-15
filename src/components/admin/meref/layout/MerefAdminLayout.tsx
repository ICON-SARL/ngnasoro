import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MerefSidebar } from './MerefSidebar';
import { MerefBreadcrumb } from './MerefBreadcrumb';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Footer } from '@/components';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function MerefAdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SuperAdminHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <MerefSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <MerefBreadcrumb />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
