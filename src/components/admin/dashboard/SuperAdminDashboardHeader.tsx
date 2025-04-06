
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export const SuperAdminDashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-xl font-medium text-gray-800">Tableau de bord - MEREF</h1>
        <p className="text-gray-500 text-sm">
          Supervision des SFDs, des comptes administrateurs et des subventions
        </p>
      </div>
      
      <div className="mt-4 md:mt-0">
        <Badge className="bg-amber-50 text-amber-700 border border-amber-100 rounded-md px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          Mode Super Administrateur
        </Badge>
      </div>
    </div>
  );
};
