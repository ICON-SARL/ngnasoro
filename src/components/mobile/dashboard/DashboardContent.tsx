
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CreditCard, ArrowRight, RefreshCw, Signal } from 'lucide-react';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import AccountBalance from '../financial-snapshot/AccountBalance';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export interface DashboardContentProps {
  onRefresh?: () => Promise<boolean>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ onRefresh }) => {
  const { dashboardData, isLoading, refreshDashboardData, isRealTimeConnected } = useMobileDashboard();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshDashboardData();
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Real-time connectivity indicator */}
      <div className="flex items-center justify-end text-xs text-gray-500 px-4">
        <Signal className={`h-3 w-3 mr-1 ${isRealTimeConnected ? 'text-green-500' : 'text-gray-400'}`} />
        {isRealTimeConnected ? 'En direct' : 'Hors ligne'}
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2 p-0 h-5"
          disabled={isRefreshing}
          onClick={handleManualRefresh}
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Account Summary Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Résumé du compte</h2>
          </div>
          
          <div className="mb-4">
            <AccountBalance />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-sm flex-1"
              onClick={() => navigate('/mobile-flow/payment')}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Transfert
            </Button>
            <Button 
              variant="outline"
              className="border-[#0D6A51] text-[#0D6A51] text-sm flex-1"
              onClick={() => navigate('/mobile-flow/transactions')}
            >
              Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Financial Summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Aperçu Financier</h2>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between p-2 border-b">
                <span className="text-gray-600">Revenus</span>
                <span className="font-medium text-green-600">
                  +{dashboardData?.financialSummary?.income.toLocaleString() || 0} FCFA
                </span>
              </div>
              
              <div className="flex justify-between p-2 border-b">
                <span className="text-gray-600">Dépenses</span>
                <span className="font-medium text-red-600">
                  -{dashboardData?.financialSummary?.expenses.toLocaleString() || 0} FCFA
                </span>
              </div>
              
              <div className="flex justify-between p-2">
                <span className="font-medium">Épargne</span>
                <span className="font-medium">
                  {dashboardData?.financialSummary?.savings.toLocaleString() || 0} FCFA
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Active Loans */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Prêts actifs</h2>
            <Button 
              variant="ghost" 
              className="text-sm text-[#0D6A51] p-0 h-auto font-medium"
              onClick={() => navigate('/mobile-flow/my-loans')}
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : dashboardData?.nearestLoan ? (
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{dashboardData.nearestLoan.purpose || 'Prêt'}</h3>
                  <p className="text-sm text-gray-500">
                    Prochain paiement: {new Date(dashboardData.nearestLoan.next_payment_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{dashboardData.nearestLoan.monthly_payment.toLocaleString()} FCFA</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-1"
                    onClick={() => navigate(`/mobile-flow/loan/${dashboardData.nearestLoan.id}`)}
                  >
                    Détails
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium mb-1">Pas de prêts actifs</h3>
              <p className="text-sm text-gray-500 mb-3">Vous n'avez pas de prêts en cours</p>
              <Button 
                variant="outline"
                className="border-[#0D6A51] text-[#0D6A51]"
                onClick={() => navigate('/mobile-flow/loan-plans')}
              >
                Demander un prêt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* SFD Accounts */}
      {dashboardData?.sfdAccounts && dashboardData.sfdAccounts.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Mes institutions</h2>
            </div>
            
            <div className="space-y-2">
              {dashboardData.sfdAccounts.map((sfdAccount: any) => (
                <div key={sfdAccount.id} className="flex items-center p-2 border rounded-md">
                  {sfdAccount.sfds?.logo_url ? (
                    <img 
                      src={sfdAccount.sfds.logo_url} 
                      alt={sfdAccount.sfds.name} 
                      className="w-8 h-8 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {sfdAccount.sfds?.name?.substring(0, 2) || 'SF'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{sfdAccount.sfds?.name || 'SFD'}</p>
                    <p className="text-xs text-gray-600">{sfdAccount.sfds?.region || ''}</p>
                  </div>
                  {sfdAccount.is_default && (
                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Par défaut
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardContent;
