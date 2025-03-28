
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  CreditCard, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const SfdLoansPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewLoanDialog, setOpenNewLoanDialog] = useState(false);
  const [openSubsidyRequestDialog, setOpenSubsidyRequestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // New loan form state
  const [loanForm, setLoanForm] = useState({
    client_id: '',
    amount: '',
    duration_months: '',
    interest_rate: '',
    purpose: '',
    subsidy_requested: false,
    subsidy_amount: '',
    subsidy_justification: ''
  });
  
  // Fetch loans on component mount
  useEffect(() => {
    fetchLoans();
  }, []);
  
  const fetchLoans = async () => {
    setLoading(true);
    try {
      const loansData = await sfdLoanApi.getSfdLoans();
      setLoans(loansData);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoanForm({
      ...loanForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSelectChange = (name, value) => {
    setLoanForm({
      ...loanForm,
      [name]: value
    });
  };
  
  const handleCreateLoan = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate monthly payment (simplified formula)
      const amount = parseFloat(loanForm.amount);
      const rate = parseFloat(loanForm.interest_rate) / 100 / 12; // Monthly interest rate
      const duration = parseInt(loanForm.duration_months);
      const monthlyPayment = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
      
      // Create loan data
      const loanData = {
        client_id: loanForm.client_id,
        sfd_id: user?.sfd_id, // Assuming user has sfd_id
        amount: amount,
        duration_months: duration,
        interest_rate: parseFloat(loanForm.interest_rate),
        purpose: loanForm.purpose,
        monthly_payment: monthlyPayment,
        subsidy_amount: loanForm.subsidy_requested ? parseFloat(loanForm.subsidy_amount) : 0,
      };
      
      await sfdLoanApi.createLoan(loanData);
      
      // If subsidy requested, create a subsidy request
      if (loanForm.subsidy_requested && parseFloat(loanForm.subsidy_amount) > 0) {
        // This would be handled by a separate API call to create a subsidy request
        // For now we'll just show a toast notification
        toast({
          title: 'Demande de subvention créée',
          description: 'Votre demande de subvention a été soumise au MEREF',
        });
      }
      
      toast({
        title: 'Prêt créé',
        description: 'Le prêt a été créé avec succès',
      });
      
      // Reset form and close dialog
      setLoanForm({
        client_id: '',
        amount: '',
        duration_months: '',
        interest_rate: '',
        purpose: '',
        subsidy_requested: false,
        subsidy_amount: '',
        subsidy_justification: ''
      });
      setOpenNewLoanDialog(false);
      
      // Refresh loans list
      fetchLoans();
      
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le prêt',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateSubsidyRequest = async (e) => {
    e.preventDefault();
    try {
      toast({
        title: 'Demande de subvention soumise',
        description: 'Votre demande a été soumise au MEREF pour approbation',
      });
      setOpenSubsidyRequestDialog(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de subvention',
        variant: 'destructive',
      });
    }
  };
  
  // Mock clients for the demo
  const clients = [
    { id: 'client1', full_name: 'Aissatou Diallo' },
    { id: 'client2', full_name: 'Mamadou Sy' },
    { id: 'client3', full_name: 'Fatou Ndiaye' },
    { id: 'client4', full_name: 'Ibrahim Sow' },
  ];
  
  // Filter loans based on active tab
  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'all') return true;
    return loan.status === activeTab;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Prêts SFD</h1>
            <p className="text-muted-foreground">Gestion et suivi des prêts de votre institution</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenSubsidyRequestDialog(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Demande de Subvention
            </Button>
            
            <Button onClick={() => setOpenNewLoanDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Prêt
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">Tous les prêts</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="approved">Approuvés</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Prêts {activeTab === 'all' ? '' : activeTab}</CardTitle>
                <CardDescription>
                  {activeTab === 'pending' && 'Prêts en attente d\'approbation'}
                  {activeTab === 'approved' && 'Prêts approuvés en attente de décaissement'}
                  {activeTab === 'active' && 'Prêts actifs en cours de remboursement'}
                  {activeTab === 'rejected' && 'Prêts rejetés'}
                  {activeTab === 'all' && 'Tous les prêts de la SFD'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Chargement des prêts...</p>
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
                        <TableHead>Statut</TableHead>
                        <TableHead>Subvention</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Aucun prêt trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLoans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell className="font-medium">{loan.reference || loan.id.substring(0, 8)}</TableCell>
                            <TableCell>{loan.client_name || 'Client #' + loan.client_id.substring(0, 4)}</TableCell>
                            <TableCell>{loan.amount.toLocaleString()} FCFA</TableCell>
                            <TableCell>{loan.duration_months} mois</TableCell>
                            <TableCell>{loan.interest_rate}%</TableCell>
                            <TableCell>
                              {loan.status === 'pending' && <Badge variant="outline">En attente</Badge>}
                              {loan.status === 'approved' && <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>}
                              {loan.status === 'active' && <Badge className="bg-green-100 text-green-800">Actif</Badge>}
                              {loan.status === 'rejected' && <Badge className="bg-red-100 text-red-800">Rejeté</Badge>}
                            </TableCell>
                            <TableCell>
                              {loan.subsidy_amount > 0 ? 
                                `${loan.subsidy_amount.toLocaleString()} FCFA` : 
                                'Non'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/sfd-loans/${loan.id}`)}>
                                <FileText className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* New Loan Dialog */}
        <Dialog open={openNewLoanDialog} onOpenChange={setOpenNewLoanDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau Prêt</DialogTitle>
              <DialogDescription>
                Créez un nouveau prêt pour un client. Remplissez tous les champs obligatoires.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLoan}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <Label htmlFor="client_id">Client</Label>
                  <Select 
                    name="client_id" 
                    value={loanForm.client_id} 
                    onValueChange={(value) => handleSelectChange('client_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={loanForm.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="duration_months">Durée (mois)</Label>
                  <Input
                    id="duration_months"
                    name="duration_months"
                    type="number"
                    value={loanForm.duration_months}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                  <Input
                    id="interest_rate"
                    name="interest_rate"
                    type="number"
                    step="0.01"
                    value={loanForm.interest_rate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="purpose">Objet du prêt</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    value={loanForm.purpose}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="subsidy_requested"
                      name="subsidy_requested"
                      type="checkbox"
                      className="w-4 h-4"
                      checked={loanForm.subsidy_requested}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="subsidy_requested">Demander une subvention du MEREF</Label>
                  </div>
                </div>
                
                {loanForm.subsidy_requested && (
                  <>
                    <div className="col-span-1">
                      <Label htmlFor="subsidy_amount">Montant de la subvention (FCFA)</Label>
                      <Input
                        id="subsidy_amount"
                        name="subsidy_amount"
                        type="number"
                        value={loanForm.subsidy_amount}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="subsidy_justification">Justification de la subvention</Label>
                      <Textarea
                        id="subsidy_justification"
                        name="subsidy_justification"
                        value={loanForm.subsidy_justification}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenNewLoanDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer le prêt</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Subsidy Request Dialog */}
        <Dialog open={openSubsidyRequestDialog} onOpenChange={setOpenSubsidyRequestDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Demande de Subvention au MEREF</DialogTitle>
              <DialogDescription>
                Demandez une subvention auprès du MEREF pour financer vos prêts à taux réduit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubsidyRequest}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="amount">Montant demandé (FCFA)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="purpose">Objet de la subvention</Label>
                  <Select name="purpose" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un objet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="women_empowerment">Autonomisation des femmes</SelectItem>
                      <SelectItem value="youth_employment">Emploi des jeunes</SelectItem>
                      <SelectItem value="small_business">Petites entreprises</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="region">Région ciblée</Label>
                  <Select name="region" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dakar">Dakar</SelectItem>
                      <SelectItem value="thies">Thiès</SelectItem>
                      <SelectItem value="saint_louis">Saint-Louis</SelectItem>
                      <SelectItem value="ziguinchor">Ziguinchor</SelectItem>
                      <SelectItem value="kaolack">Kaolack</SelectItem>
                      <SelectItem value="nationwide">Nationale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="justification">Justification</Label>
                  <Textarea
                    id="justification"
                    name="justification"
                    placeholder="Expliquez pourquoi cette subvention est nécessaire et comment elle sera utilisée..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expected_impact">Impact attendu</Label>
                  <Textarea
                    id="expected_impact"
                    name="expected_impact"
                    placeholder="Décrivez l'impact social et économique attendu de cette subvention..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenSubsidyRequestDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Soumettre la demande</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SfdLoansPage;
