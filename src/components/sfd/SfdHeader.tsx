
import React from 'react';
import { Link } from 'react-router-dom';
import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SfdSelector } from './SfdSelector';
import { Shield } from 'lucide-react';

export function SfdHeader() {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/sfd/dashboard" className="text-xl font-bold text-primary">
            NGNA SORO
          </Link>
          <SfdSelector />
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/sfd/permissions">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Permissions</span>
            </Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
