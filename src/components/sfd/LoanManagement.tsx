
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle,
  XCircle,
  Search,
  CreditCard,
  Calendar,
  Percent,
  DollarSign,
  CircleDollarSign
} from 'lucide-react';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { Loan, SfdClient } from '@/types/sfdClients';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useAuth } from '@/hooks/useAuth';

export const LoanManagement = () => {
  const [isNewLoanDialogOpen, setIsNewLoanDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newLoanData, setNewLoanData] = useState({
    amount: 0,
    duration_months: 12,
    interest_rate: 5.5,
    purpose: '',
    subsidy_amount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  const { 
    loans, 
    isLoading: isLoadingLoans, 
    createLoan,
    approveLoan,
    rejectLoan,
    disburseLoan 
  } = useSfdLoans();

  const { 
    clients, 
    isLoading: isLoadingClients 
  } = useSfdClients();

  const validatedClients = clients.filter(client => client.status === 'validated');

  const handleCreateLoan = async () => {
    if (!selectedClientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    if (newLoanData.amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant du prêt doit être supérieur à zéro",
        variant: "destructive",
      });
      return;
    }

    if (!user?.sfd_id) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer votre SFD",
        variant: "destructive",
      });
      return;
    }

    const monthlyPayment = calculateMonthlyPayment(
      newLoanData.amount,
      newLoanData.interest_rate,
      newLoanData.duration_months
    );

    try {
      await createLoan.mutateAsync({
        client_id: selectedClientId,
        sfd_id: user.sfd_id,
        amount: newLoanData.amount,
        duration_months: newLoanData.duration_months,
        interest_rate: newLoanData.interest_rate,
        purpose: newLoanData.purpose,
        monthly_payment: parseFloat(monthlyPayment),
        subsidy_amount: newLoanData.subsidy_amount
      });

      setIsNewLoanDialogOpen(false);
      setSelectedClientId(null);
      setNewLoanData({
        amount: 0,
        duration_months: 12,
        interest_rate: 5.5,
        purpose: '',
        subsidy_amount: 0
      });
    } catch (error) {
      console.error("Error creating loan:", error);
    }
  };

  const calculateMonthlyPayment = (amount: number, interest: number, duration: number) => {
    const monthlyInterest = interest / 100 / 12;
    const payment = 
      (amount * monthlyInterest * Math.pow(1 + monthlyInterest, duration)) / 
      (Math.pow(1 + monthlyInterest, duration) - 1);
    return payment.toFixed(2);
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = searchTerm === '' || 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && loan.status === 'pending';
    if (activeTab === 'approved') return matchesSearch && loan.status === 'approved';
    if (activeTab === 'active') return matchesSearch && loan.status === 'active';
    if (activeTab === 'completed') return matchesSearch && loan.status === 'completed';
    if (activeTab === 'defaulted') return matchesSearch && loan.status === 'defaulted';
    return matchesSearch;
  });

  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.full_name : 'Client inconnu';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-[#0D6A51]/20 text-[#0D6A51]">Terminé</Badge>;
      case 'defaulted':
        return <Badge className="bg-red-100 text-red-800">Défaut</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Prêts</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les prêts de votre SFD et les subventions MEREF
          </p>
        </div>
        
        <Button onClick={() => setIsNewLoanDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nouveau Prêt
        </Button>
      </div>
      
      <div className="flex items-center mb-4 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un prêt..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="approved">Approuvés</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="defaulted">Défaut</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Liste des Prêts</CardTitle>
          <CardDescription>
            Gérez les demandes de prêt et les prêts actifs de votre SFD
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          {isLoadingLoans ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-pulse" />
              <p>Chargement des prêts...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p>Aucun prêt trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Subvention</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.id.substring(0, 8)}</TableCell>
                    <TableCell>{getClientName(loan.client_id)}</TableCell>
                    <TableCell>{loan.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{loan.duration_months} mois</TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>
                      {loan.subsidy_amount ? (
                        <span className="text-[#0D6A51]">
                          {loan.subsidy_amount.toLocaleString()} FCFA
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Aucune</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Détails</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Détails du Prêt</DialogTitle>
                              <DialogDescription>Informations détaillées sur le prêt</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">ID</p>
                                  <p className="font-medium">{loan.id.substring(0, 8)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Client</p>
                                  <p className="font-medium">{getClientName(loan.client_id)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Montant</p>
                                  <p className="font-medium">{loan.amount.toLocaleString()} FCFA</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Durée</p>
                                  <p className="font-medium">{loan.duration_months} mois</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Taux d'intérêt</p>
                                  <p className="font-medium">{loan.interest_rate}%</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Paiement mensuel</p>
                                  <p className="font-medium">
                                    {calculateMonthlyPayment(
                                      loan.amount, 
                                      loan.interest_rate, 
                                      loan.duration_months
                                    )} FCFA
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Subvention MEREF</p>
                                  <p className="font-medium">
                                    {loan.subsidy_amount ? 
                                      `${loan.subsidy_amount.toLocaleString()} FCFA` : 
                                      'Aucune'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Statut</p>
                                  <div className="mt-1">{getStatusBadge(loan.status)}</div>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Objet du prêt</p>
                                <p className="font-medium">{loan.purpose}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Dates</p>
                                <div className="text-sm grid grid-cols-2 gap-2 mt-1">
                                  <div>
                                    <span className="block text-muted-foreground">Création:</span>
                                    <span>{new Date(loan.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {loan.approved_at && (
                                    <div>
                                      <span className="block text-muted-foreground">Approbation:</span>
                                      <span>{new Date(loan.approved_at).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {loan.disbursed_at && (
                                    <div>
                                      <span className="block text-muted-foreground">Décaissement:</span>
                                      <span>{new Date(loan.disbursed_at).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {loan.next_payment_date && (
                                    <div>
                                      <span className="block text-muted-foreground">Prochain paiement:</span>
                                      <span>{new Date(loan.next_payment_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {loan.status === 'pending' && (
                              <DialogFooter className="gap-2">
                                <Button 
                                  variant="destructive"
                                  onClick={() => rejectLoan.mutate({ loanId: loan.id })}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeter
                                </Button>
                                <Button 
                                  variant="default"
                                  onClick={() => approveLoan.mutate({ loanId: loan.id })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approuver
                                </Button>
                              </DialogFooter>
                            )}
                            {loan.status === 'approved' && (
                              <DialogFooter>
                                <Button 
                                  onClick={() => disburseLoan.mutate({ loanId: loan.id })}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Procéder au décaissement
                                </Button>
                              </DialogFooter>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {loan.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rejectLoan.mutate({ loanId: loan.id })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only">Rejeter</span>
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => approveLoan.mutate({ loanId: loan.id })}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only">Approuver</span>
                            </Button>
                          </>
                        )}
                        
                        {loan.status === 'approved' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => disburseLoan.mutate({ loanId: loan.id })}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            <span className="sr-only sm:not-sr-only">Décaisser</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isNewLoanDialogOpen} onOpenChange={setIsNewLoanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Création d'un nouveau prêt</DialogTitle>
            <DialogDescription>
              Créez un nouveau prêt pour un client existant
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client</label>
              <Select 
                onValueChange={(value) => setSelectedClientId(value)}
                value={selectedClientId || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Clients validés</SelectLabel>
                    {validatedClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Montant (FCFA)</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pl-8"
                    value={newLoanData.amount}
                    onChange={(e) => setNewLoanData({
                      ...newLoanData,
                      amount: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Durée (mois)</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pl-8"
                    value={newLoanData.duration_months}
                    onChange={(e) => setNewLoanData({
                      ...newLoanData,
                      duration_months: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Taux d'intérêt (%)</label>
                <div className="relative">
                  <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.1"
                    className="pl-8"
                    value={newLoanData.interest_rate}
                    onChange={(e) => setNewLoanData({
                      ...newLoanData,
                      interest_rate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subvention MEREF (FCFA)</label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-[#0D6A51]" />
                  <Input
                    type="number"
                    className="pl-8"
                    value={newLoanData.subsidy_amount}
                    onChange={(e) => setNewLoanData({
                      ...newLoanData,
                      subsidy_amount: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Objet du prêt</label>
              <Textarea
                value={newLoanData.purpose}
                onChange={(e) => setNewLoanData({
                  ...newLoanData,
                  purpose: e.target.value
                })}
                placeholder="Décrivez l'objet du prêt..."
              />
            </div>
            
            {newLoanData.amount > 0 && newLoanData.duration_months > 0 && newLoanData.interest_rate > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Paiement mensuel estimé:</p>
                <p className="text-xl font-semibold text-[#0D6A51]">
                  {calculateMonthlyPayment(
                    newLoanData.amount, 
                    newLoanData.interest_rate, 
                    newLoanData.duration_months
                  )} FCFA
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewLoanDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateLoan}>
              Créer le prêt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Prêts Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {loans.filter(loan => loan.status === 'active').length}
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Montant Total Décaissé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {loans
                  .filter(loan => loan.status === 'active' || loan.status === 'completed')
                  .reduce((sum, loan) => sum + loan.amount, 0)
                  .toLocaleString()} FCFA
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Subventions Utilisées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {loans
                  .filter(loan => loan.status === 'active' || loan.status === 'completed')
                  .reduce((sum, loan) => sum + (loan.subsidy_amount || 0), 0)
                  .toLocaleString()} FCFA
              </div>
              <div className="p-2 bg-[#0D6A51]/10 rounded-full">
                <CircleDollarSign className="h-5 w-5 text-[#0D6A51]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
