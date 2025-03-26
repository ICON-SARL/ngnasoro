
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const FinancialOverview = () => {
  return (
    <div className="px-4">
      <h2 className="font-medium text-lg mb-3">Revenus & dépenses</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-green-100 border-0 rounded-xl">
          <CardContent className="p-4 flex flex-col">
            <div className="rounded-full bg-green-200 w-12 h-12 flex items-center justify-center mb-3">
              <div className="rounded-full bg-green-300 w-10 h-10 flex items-center justify-center">
                {/* Semi-circle chart */}
                <div className="rotate-180 w-8 h-4 overflow-hidden">
                  <div className="h-8 w-8 rounded-full border-4 border-green-500 -translate-y-4"></div>
                </div>
              </div>
            </div>
            <p className="text-xl font-bold">1 845 810</p>
            <p className="text-xs text-gray-600">Dépensé</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-100 border-0 rounded-xl">
          <CardContent className="p-4 flex flex-col">
            <div className="rounded-full bg-purple-200 w-12 h-12 flex items-center justify-center mb-3">
              <div className="rounded-full bg-purple-300 w-10 h-10 flex items-center justify-center">
                {/* Semi-circle chart */}
                <div className="w-8 h-4 overflow-hidden">
                  <div className="h-8 w-8 rounded-full border-4 border-purple-500 translate-y-4"></div>
                </div>
              </div>
            </div>
            <p className="text-xl font-bold">1 365 320</p>
            <p className="text-xs text-gray-600">Reçu</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
