
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, FileBarChart } from 'lucide-react';
import { type SfdMetrics } from '@/hooks/useSfdDashboardMetrics';
import { formatCurrency } from '@/utils/format';

interface SfdDashboardProps {
  metrics?: SfdMetrics;
}

export function SfdDashboard({ metrics }: SfdDashboardProps) {
  if (!metrics) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loan Portfolio Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portefeuille de prêts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.loanPortfolio.total || 0)} FCFA
            </div>
            <div className={`flex items-center text-xs ${
              (metrics.loanPortfolio.monthlyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            } mt-2`}>
              {(metrics.loanPortfolio.monthlyGrowth || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>
                {Math.abs(metrics.loanPortfolio.monthlyGrowth).toFixed(1)}% 
                {(metrics.loanPortfolio.monthlyGrowth || 0) >= 0 
                  ? ' par rapport au mois dernier' 
                  : ' de baisse par rapport au mois dernier'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Clients Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeClients.total || 0}</div>
            <div className={`flex items-center text-xs ${
              (metrics.activeClients.monthlyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            } mt-2`}>
              {(metrics.activeClients.monthlyGrowth || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>
                {Math.abs(metrics.activeClients.monthlyGrowth).toFixed(1)}%
                {(metrics.activeClients.monthlyGrowth || 0) >= 0 
                  ? ' par rapport au mois dernier' 
                  : ' de baisse par rapport au mois dernier'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Repayment Rate Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de remboursement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.repaymentRate.current.toFixed(1)}%</div>
            <div className={`flex items-center text-xs ${
              (metrics.repaymentRate.monthlyChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            } mt-2`}>
              {(metrics.repaymentRate.monthlyChange || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>
                {Math.abs(metrics.repaymentRate.monthlyChange).toFixed(1)}%
                {(metrics.repaymentRate.monthlyChange || 0) >= 0 
                  ? ' par rapport au mois dernier' 
                  : ' de baisse par rapport au mois dernier'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Clients and Loans Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Nouveaux clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentClients.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentClients.map((client) => (
                  <div key={client.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Inscrit le {formatDate(client.registrationDate)}
                      </div>
                    </div>
                    <div className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      Nouveau
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Aucun client récent</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Prêts récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentLoans.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentLoans.map((loan) => (
                  <div key={loan.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">Prêt #{loan.id.substring(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(loan.amount)} FCFA sur {loan.duration} mois
                      </div>
                    </div>
                    <div className={`text-sm px-2 py-1 rounded ${
                      loan.status === 'active' 
                        ? 'bg-green-50 text-green-600'
                        : loan.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-gray-50 text-gray-600'
                    }`}>
                      {loan.status === 'active' ? 'Actif' : 
                       loan.status === 'pending' ? 'En attente' : 
                       loan.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Aucun prêt récent</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
