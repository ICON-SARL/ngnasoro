
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FinancialOverview = () => {
  return (
    <div className="mx-4 mt-3">
      <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Income</p>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">+$5,400</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Expense</p>
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">-$3,543</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Last month savings</p>
              <div className="flex items-center">
                <p className="font-medium">$520</p>
                <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
              </div>
            </div>
          </div>
          
          <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-xl font-medium">
            Analyze now
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
