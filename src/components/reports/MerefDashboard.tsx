
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimplifiedMerefDashboard } from '@/components/admin/dashboard/SimplifiedMerefDashboard';
import { FinancialReporting } from '@/components/FinancialReporting';
import { ReportGenerator } from '@/components/ReportGenerator';
import { DataExport } from '@/components/DataExport';
import { Button } from '@/components/ui/button';
import { Download, FileText, PieChart } from 'lucide-react';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { subMonths } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

export const MerefDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isGenerating, generateReport } = useReportGeneration();
  const { accounts, isLoading: isLoadingAccounts } = useSfdAccounts();

  // Generate quick report handlers
  const handleGenerateTransactionReport = async () => {
    await generateReport({
      type: 'transactions',
      startDate: subMonths(new Date(), 1),
      endDate: new Date(),
      format: 'pdf'
    });
  };

  const handleGenerateSubsidyReport = async () => {
    await generateReport({
      type: 'subsidies',
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
      format: 'excel'
    });
  };

  const handleGenerateSfdsReport = async () => {
    await generateReport({
      type: 'sfds',
      startDate: subMonths(new Date(), 12),
      endDate: new Date(),
      format: 'pdf'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  // Get total balance across all SFDs
  const totalSfdBalance = accounts?.reduce((total, account) => total + account.balance, 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de Bord MEREF</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance Totale SFD</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAccounts ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalSfdBalance)}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de SFD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAccounts ? <Skeleton className="h-8 w-20" /> : accounts?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rapports Générés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerateTransactionReport}
          disabled={isGenerating}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Rapport de Transactions
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerateSubsidyReport}
          disabled={isGenerating}
          className="flex items-center gap-1"
        >
          <FileText className="h-4 w-4" />
          Rapport de Subventions
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerateSfdsReport}
          disabled={isGenerating}
          className="flex items-center gap-1"
        >
          <PieChart className="h-4 w-4" />
          Rapport des SFDs
        </Button>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="export">Exportation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <SimplifiedMerefDashboard />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-6">
          <FinancialReporting />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <ReportGenerator />
        </TabsContent>
        
        <TabsContent value="export" className="mt-6">
          <DataExport />
        </TabsContent>
      </Tabs>
      
      {/* SFD Accounts Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Comptes SFD Consolidés</h2>
        
        {isLoadingAccounts ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SFD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de Compte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts?.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{account.sfd_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {account.account_type === 'operation' ? 'Opérations' : 
                       account.account_type === 'remboursement' ? 'Remboursements' : 'Épargne'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(account.balance)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!accounts || accounts.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun compte SFD trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
