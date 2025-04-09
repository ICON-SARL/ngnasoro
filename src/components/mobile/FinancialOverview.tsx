
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Building, BarChart3, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';

const FinancialOverview = () => {
  const navigate = useNavigate();
  const { dashboardData, isLoading } = useMobileDashboard();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  const financialSummary = dashboardData?.financialSummary || {
    income: 0,
    expenses: 0,
    savings: 0,
    sfdCount: 0
  };
  
  return (
    <div className="mx-4 mt-4">
      <Card className="border-0 shadow-soft bg-white rounded-3xl overflow-hidden hover:shadow-soft-lg transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Aperçu Financier</h3>
            <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] text-xs border-0 rounded-full py-1 px-3">
              <Building className="h-3 w-3 mr-1" />
              Multi-SFD
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-2xl card-hover">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Revenus</p>
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                {isLoading ? "..." : formatCurrency(financialSummary.income)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Consolidé sur {financialSummary.sfdCount || 0} SFDs
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-4 rounded-2xl card-hover">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">Dépenses</p>
                <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                {isLoading ? "..." : formatCurrency(financialSummary.expenses)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Consolidé sur {financialSummary.sfdCount || 0} SFDs
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Épargne du mois dernier</p>
              <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                <p className="font-medium text-sm mr-1">
                  {isLoading ? "..." : formatCurrency(financialSummary.savings)}
                </p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
          
          <button 
            className="mt-4 w-full bg-gradient-to-r from-[#0D6A51] to-[#13A180] text-white py-3 rounded-xl font-medium transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center"
            onClick={() => navigate('/solvency-engine')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyser maintenant
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
