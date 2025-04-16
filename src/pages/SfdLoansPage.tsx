import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Plus, Calendar, 
  DollarSign, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

const SfdLoansPage = () => {
  const { isAdmin } = useAuth();
  
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
          
          <Button className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
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
                >
                  <option value="">Tous</option>
                  <option value="this-month">Ce mois</option>
                  <option value="last-month">Mois dernier</option>
                  <option value="this-year">Cette année</option>
                </select>
              </div>
              
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="all">
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
              
              <TabsContent value="all">
                <LoanTable />
              </TabsContent>
              
              <TabsContent value="pending">
                <LoanTable status="pending" />
              </TabsContent>
              
              <TabsContent value="active">
                <LoanTable status="active" />
              </TabsContent>
              
              <TabsContent value="closed">
                <LoanTable status="closed" />
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
              <div className="text-3xl font-bold">42</div>
              <p className="text-muted-foreground">Total: 12,500,000 FCFA</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Taux de remboursement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87%</div>
              <p className="text-muted-foreground">+2% depuis le mois dernier</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prêts en retard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">7</div>
              <p className="text-muted-foreground">Total: 1,200,000 FCFA</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LoanTable = ({ status = 'all' }) => {
  // Données fictives pour la démonstration
  const loans = [
    {
      id: 'L-2023-001',
      client: 'Amadou Diallo',
      amount: 500000,
      status: 'active',
      startDate: '2023-05-15',
      endDate: '2023-11-15',
      interestRate: 5.5,
      remainingAmount: 250000
    },
    {
      id: 'L-2023-002',
      client: 'Fatou Camara',
      amount: 1000000,
      status: 'pending',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      interestRate: 6.0,
      remainingAmount: 1000000
    },
    {
      id: 'L-2023-003',
      client: 'Ibrahim Touré',
      amount: 750000,
      status: 'closed',
      startDate: '2023-02-10',
      endDate: '2023-08-10',
      interestRate: 5.0,
      remainingAmount: 0
    },
    {
      id: 'L-2023-004',
      client: 'Aïssatou Bah',
      amount: 300000,
      status: 'active',
      startDate: '2023-04-20',
      endDate: '2023-10-20',
      interestRate: 5.5,
      remainingAmount: 100000
    }
  ];
  
  // Filtrer les prêts selon le statut sélectionné
  const filteredLoans = status === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === status);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Clôturé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date début</TableHead>
            <TableHead>Date fin</TableHead>
            <TableHead>Taux</TableHead>
            <TableHead>Restant</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLoans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Aucun prêt trouvé
              </TableCell>
            </TableRow>
          ) : (
            filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.id}</TableCell>
                <TableCell>{loan.client}</TableCell>
                <TableCell>{loan.amount.toLocaleString()} FCFA</TableCell>
                <TableCell>{getStatusBadge(loan.status)}</TableCell>
                <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(loan.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{loan.interestRate}%</TableCell>
                <TableCell>{loan.remainingAmount.toLocaleString()} FCFA</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SfdLoansPage;
