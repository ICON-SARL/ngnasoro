
import React from 'react';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

interface SuperAdminHeaderProps {
  additionalComponents?: React.ReactNode;
}

export function SuperAdminHeader({ additionalComponents }: SuperAdminHeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center">
            <Building className="h-6 w-6 text-[#0D6A51] mr-2" />
            <span className="font-bold text-xl">Admin MEREF</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {additionalComponents}
            <div className="text-sm">
              <span className="font-medium">{user?.full_name}</span>
              <span className="text-gray-500 block text-xs">{user?.email}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#0D6A51] text-white flex items-center justify-center">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
