
import React, { useState } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoanTable } from '@/components/sfd/loans/LoanTable';
import { Search, Filter, Plus, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useLoanStats } from '@/hooks/useLoanStats';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const SfdLoansPage = () => {
  const { isAdmin } = useAuth();
  const { stats, loading: statsLoading } = useLoanStats();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <SfdHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Prêts</h1>
            <p className="text-muted-foreground">
              Suivez et gérez tous les prêts de votre SFD
            </p>
          </div>
          
          <Button className="bg-[#0D6A51] hover:bg-[#0D6A51]/90" onClick={() => navigate('/sfd/loans/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Prêt
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
              <div className="flex-1">
                <label htmlFor="search" className="text-sm font-medium block mb-2">
                  Rechercher un prêt
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Numéro, client ou montant..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label htmlFor="status-filter" className="text-sm font-medium block mb-2">
                  Période
                </label>
                <select
                  id="status-filter"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="this-month">Ce mois</option>
                  <option value="last-month">Mois dernier</option>
                  <option value="this-year">Cette année</option>
                </select>
              </div>
              
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all" className="flex items-center justify-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Tous
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-2" />
                  En attente
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Actifs
                </TabsTrigger>
                <TabsTrigger value="closed" className="flex items-center justify-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  Clôturés
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <LoanTable 
                  status={activeTab} 
                  searchQuery={searchQuery} 
                  periodFilter={periodFilter} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prêts en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", statsLoading && "animate-pulse")}>
                {statsLoading ? "-" : stats.activeLoans}
              </div>
              <p className="text-muted-foreground">
                Total: {statsLoading ? "-" : formatCurrency(stats.totalActiveAmount)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Taux de remboursement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", statsLoading && "animate-pulse")}>
                {statsLoading ? "-" : `${stats.repaymentRate}%`}
              </div>
              <p className="text-muted-foreground">
                {statsLoading ? "-" : `${stats.repaymentChange > 0 ? '+' : ''}${stats.repaymentChange}% depuis le mois dernier`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prêts en retard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold text-red-500", statsLoading && "animate-pulse")}>
                {statsLoading ? "-" : stats.lateLoans}
              </div>
              <p className="text-muted-foreground">
                Total: {statsLoading ? "-" : formatCurrency(stats.lateAmount)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SfdLoansPage;
