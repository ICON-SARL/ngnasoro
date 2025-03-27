
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export const SuperAdminDashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord Super Admin - MEREF</h1>
        <p className="text-gray-500">
          Gérez les SFDs, les comptes administrateurs et les subventions
        </p>
      </div>
      
      <div className="mt-4 md:mt-0">
        <Badge className="bg-[#FFAB2E]/10 text-[#FFAB2E] border-[#FFAB2E]/20 rounded-md px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          Mode Super Administrateur
        </Badge>
      </div>
    </div>
  );
};
