
import React, { useState } from 'react';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, PlusCircle, RefreshCw } from 'lucide-react';
import { useLoansPage } from '@/hooks/sfd/useLoansPage';
import LoanList from '@/components/sfd/loans/LoanList';

export default function LoansPage() {
  const { loans, isLoading, refetch } = useLoansPage();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLoans = loans.filter(loan => 
    loan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.reference?.includes(searchTerm.toLowerCase()) ||
    loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeLoans = filteredLoans.filter(loan => loan.status === 'active');
  const pendingLoans = filteredLoans.filter(loan => loan.status === 'pending');
  const completedLoans = filteredLoans.filter(loan => loan.status === 'completed');
  
  return (
    <SfdAdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Prêts</h1>
            <p className="text-muted-foreground">Gérez les prêts accordés par votre SFD</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouveau prêt
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gestion des prêts</CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client, référence ou objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Tous ({filteredLoans.length})</TabsTrigger>
                <TabsTrigger value="active">Actifs ({activeLoans.length})</TabsTrigger>
                <TabsTrigger value="pending">En attente ({pendingLoans.length})</TabsTrigger>
                <TabsTrigger value="completed">Terminés ({completedLoans.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <LoanList loans={filteredLoans} loading={isLoading} />
              </TabsContent>
              
              <TabsContent value="active">
                <LoanList loans={activeLoans} loading={isLoading} />
              </TabsContent>
              
              <TabsContent value="pending">
                <LoanList loans={pendingLoans} loading={isLoading} />
              </TabsContent>
              
              <TabsContent value="completed">
                <LoanList loans={completedLoans} loading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </SfdAdminLayout>
  );
}
