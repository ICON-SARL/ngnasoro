
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FinancialOverview = () => {
  return (
    <div className="mx-4 mt-3">
      <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Aperçu Financier</h3>
            <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] text-xs border-0">
              <Building className="h-3 w-3 mr-1" />
              Multi-SFD
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Revenus</p>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">+540.000 FCFA</p>
              <p className="text-xs text-gray-500 mt-1">Consolidé sur 2 SFDs</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Dépenses</p>
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">-354.300 FCFA</p>
              <p className="text-xs text-gray-500 mt-1">Consolidé sur 2 SFDs</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Épargne du mois dernier</p>
              <div className="flex items-center">
                <p className="font-medium">52.000 FCFA</p>
                <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
              </div>
            </div>
          </div>
          
          <button className="mt-3 w-full bg-lime-600 hover:bg-lime-700 text-white py-2 rounded-xl font-medium transition-colors">
            Analyser maintenant
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
