
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCheck, 
  XCircle, 
  AlertCircle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SubsidyRequest {
  id: string;
  amount: number;
  purpose: string;
  justification?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  region?: string;
  expected_impact?: string;
  decision_comments?: string;
}

const SfdSubsidyRequestPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subsidyRequests, setSubsidyRequests] = useState<SubsidyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewRequestDialog, setOpenNewRequestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // New request form state
  const [requestForm, setRequestForm] = useState({
    amount: '',
    purpose: '',
    justification: '',
    priority: 'normal',
    region: '',
    expected_impact: ''
  });
  
  // Mock data for demonstration
  const mockSubsidyRequests: SubsidyRequest[] = [
    {
      id: 'req1',
      amount: 5000000,
      purpose: 'Financement de projets agricoles',
      justification: 'Pour soutenir les petits agriculteurs dans la région de Thiès',
      status: 'approved',
      priority: 'high',
      created_at: '2023-05-15T10:30:00Z',
      region: 'Thiès',
      expected_impact: 'Amélioration des rendements agricoles et sécurité alimentaire',
      decision_comments: 'Approuvé pour soutenir le secteur agricole prioritaire'
    },
    {
      id: 'req2',
      amount: 3000000,
      purpose: 'Microcrédits pour commerçantes',
      justification: 'Soutien aux femmes entrepreneures dans les marchés locaux',
      status: 'pending',
      priority: 'normal',
      created_at: '2023-06-05T14:45:00Z',
      region: 'Dakar',
      expected_impact: 'Amélioration des revenus de 100 commerçantes'
    },
    {
      id: 'req3',
      amount: 2500000,
      purpose: 'Prêts pour jeunes entrepreneurs',
      justification: 'Programme de lutte contre le chômage des jeunes',
      status: 'under_review',
      priority: 'high',
      created_at: '2023-06-10T09:15:00Z',
      region: 'Saint-Louis',
      expected_impact: 'Création de 50 petites entreprises'
    },
    {
      id: 'req4',
      amount: 7500000,
      purpose: 'Financement de pêche durable',
      justification: 'Modernisation des équipements de pêche artisanale',
      status: 'rejected',
      priority: 'normal',
      created_at: '2023-04-20T11:20:00Z',
      region: 'Ziguinchor',
      expected_impact: 'Réduction de l'impact environnemental et augmentation des revenus',
      decision_comments: 'Budget insuffisant pour cette période fiscale'
    }
  ];
  
  // Load subsidy requests on component mount
  useEffect(() => {
    // In a real application, this would fetch from an API
    setTimeout(() => {
      setSubsidyRequests(mockSubsidyRequests);
      setLoading(false);
    }, 800);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value
    });
  };
  
  const handleSelectChange = (name, value) => {
    setRequestForm({
      ...requestForm,
      [name]: value
    });
  };
  
  const handleCreateRequest = (e) => {
    e.preventDefault();
    
    // In a real application, this would send to an API
    const newRequest: SubsidyRequest = {
      id: `req${Date.now()}`,
      amount: Number(requestForm.amount),
      purpose: requestForm.purpose,
      justification: requestForm.justification,
      status: 'pending',
      priority: requestForm.priority as 'low' | 'normal' | 'high' | 'urgent',
      created_at: new Date().toISOString(),
      region: requestForm.region,
      expected_impact: requestForm.expected_impact
    };
    
    setSubsidyRequests([newRequest, ...subsidyRequests]);
    
    toast({
      title: 'Demande soumise',
      description: 'Votre demande de subvention a été soumise avec succès au MEREF'
    });
    
    // Reset form and close dialog
    setRequestForm({
      amount: '',
      purpose: '',
      justification: '',
      priority: 'normal',
      region: '',
      expected_impact: ''
    });
    setOpenNewRequestDialog(false);
  };
  
  // Filter subsidy requests based on active tab
  const filteredRequests = subsidyRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-100">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100">Urgente</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Demandes de Subvention</h1>
            <p className="text-muted-foreground">Gérez vos demandes de subvention auprès du MEREF</p>
          </div>
          
          <Button onClick={() => setOpenNewRequestDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Demande
          </Button>
        </div>
        
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="under_review">En examen</TabsTrigger>
            <TabsTrigger value="approved">Approuvées</TabsTrigger>
            <TabsTrigger value="rejected">Rejetées</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Demandes de subvention</CardTitle>
                <CardDescription>
                  {filteredRequests.length} demande(s) trouvée(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Chargement des demandes...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Objet</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Aucune demande trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              {new Date(request.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.purpose}
                            </TableCell>
                            <TableCell>
                              {request.amount.toLocaleString()} FCFA
                            </TableCell>
                            <TableCell>
                              {request.region || 'Non spécifié'}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(request.priority)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/sfd-subsidy-requests/${request.id}`)}>
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
        
        {/* New Subsidy Request Dialog */}
        <Dialog open={openNewRequestDialog} onOpenChange={setOpenNewRequestDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Demande de Subvention</DialogTitle>
              <DialogDescription>
                Soumettez une demande de subvention au MEREF pour financer vos activités.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-1">
                  <Label htmlFor="amount">Montant demandé (FCFA)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={requestForm.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select
                    name="priority"
                    value={requestForm.priority}
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="purpose">Objet de la subvention</Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    value={requestForm.purpose}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Financement de microcrédits pour l'agriculture"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="justification">Justification</Label>
                  <Textarea
                    id="justification"
                    name="justification"
                    value={requestForm.justification}
                    onChange={handleInputChange}
                    placeholder="Expliquez pourquoi cette subvention est nécessaire..."
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="region">Région ciblée</Label>
                  <Select
                    name="region"
                    value={requestForm.region}
                    onValueChange={(value) => handleSelectChange('region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dakar">Dakar</SelectItem>
                      <SelectItem value="Thiès">Thiès</SelectItem>
                      <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                      <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
                      <SelectItem value="Kaolack">Kaolack</SelectItem>
                      <SelectItem value="Nationwide">Nationale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="expected_impact">Impact attendu</Label>
                  <Textarea
                    id="expected_impact"
                    name="expected_impact"
                    value={requestForm.expected_impact}
                    onChange={handleInputChange}
                    placeholder="Décrivez l'impact socio-économique attendu de cette subvention..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenNewRequestDialog(false)}>
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

export default SfdSubsidyRequestPage;
