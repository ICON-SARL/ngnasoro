
import React from 'react';
import { Settings, Users, CreditCard, Home, FileSpreadsheet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LogoutButton from '@/components/LogoutButton';

interface SfdAdminLayoutProps {
  children: React.ReactNode;
}

export function SfdAdminLayout({ children }: SfdAdminLayoutProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6 flex items-center">
          <div className="w-8 h-8 rounded-md bg-[#0D6A51] flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="ml-3 font-semibold text-xl">SFD Admin</span>
        </div>
        
        <div className="flex-1 flex flex-col py-4">
          <nav className="flex-1 px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-3 h-5 w-5" />
              Tableau de bord
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-3 h-5 w-5" />
              Clients
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-3 h-5 w-5" />
              Prêts
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FileSpreadsheet className="mr-3 h-5 w-5" />
              Rapports
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-3 h-5 w-5" />
              Paramètres
            </Button>
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <LogoutButton 
            variant="ghost" 
            className="w-full justify-start text-red-500"
            redirectPath="/auth"
          />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
