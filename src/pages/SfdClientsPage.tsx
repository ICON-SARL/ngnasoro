
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  User, 
  FileText, 
  CircleCheck,
  AlertCircle,
  Clock 
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/components/admin/types/sfd-types';

const SfdClientsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState<SfdClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<SfdClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openNewClientDialog, setOpenNewClientDialog] = useState(false);
  
  // New client form state
  const [clientForm, setClientForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    id_type: 'national_id',
    id_number: '',
    notes: ''
  });
  
  // Mock data for demonstration
  const mockClients: SfdClient[] = [
    {
      id: '1',
      full_name: 'Aminata Diallo',
      email: 'aminata.diallo@example.com',
      phone: '221-77-123-4567',
      address: 'Dakar, Sénégal',
      status: 'validated',
      kyc_level: 2,
      created_at: '2023-04-15T10:30:00Z',
      sfd_id: user?.sfd_id || ''
    },
    {
      id: '2',
      full_name: 'Ousmane Ndiaye',
      email: 'ousmane.ndiaye@example.com',
      phone: '221-78-987-6543',
      address: 'Thiès, Sénégal',
      status: 'pending',
      kyc_level: 1,
      created_at: '2023-05-20T14:45:00Z',
      sfd_id: user?.sfd_id || ''
    },
    {
      id: '3',
      full_name: 'Fatou Sow',
      email: 'fatou.sow@example.com',
      phone: '221-76-567-8901',
      address: 'Saint-Louis, Sénégal',
      status: 'validated',
      kyc_level: 3,
      created_at: '2023-03-10T09:15:00Z',
      sfd_id: user?.sfd_id || ''
    },
    {
      id: '4',
      full_name: 'Ibrahim Diop',
      email: 'ibrahim.diop@example.com',
      phone: '221-70-234-5678',
      address: 'Kaolack, Sénégal',
      status: 'suspended',
      kyc_level: 1,
      created_at: '2023-06-05T11:20:00Z',
      sfd_id: user?.sfd_id || ''
    }
  ];
  
  // Load clients on component mount
  useEffect(() => {
    // In a real application, this would fetch from an API
    setTimeout(() => {
      setClients(mockClients);
      setFilteredClients(mockClients);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter clients when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = clients.filter(client => 
      client.full_name.toLowerCase().includes(term) ||
      (client.email && client.email.toLowerCase().includes(term)) ||
      (client.phone && client.phone.includes(term)) ||
      (client.address && client.address.toLowerCase().includes(term))
    );
    
    setFilteredClients(filtered);
  }, [searchTerm, clients]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientForm({
      ...clientForm,
      [name]: value
    });
  };
  
  const handleSelectChange = (name, value) => {
    setClientForm({
      ...clientForm,
      [name]: value
    });
  };
  
  const handleCreateClient = (e) => {
    e.preventDefault();
    
    // In a real application, this would send to an API
    const newClient: SfdClient = {
      id: Date.now().toString(), // Temporary ID
      full_name: clientForm.full_name,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      status: 'pending',
      kyc_level: 0,
      created_at: new Date().toISOString(),
      sfd_id: user?.sfd_id || ''
    };
    
    setClients([newClient, ...clients]);
    setFilteredClients([newClient, ...filteredClients]);
    
    toast({
      title: 'Client créé',
      description: 'Le nouveau client a été créé avec succès'
    });
    
    // Reset form and close dialog
    setClientForm({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: 'national_id',
      id_number: '',
      notes: ''
    });
    setOpenNewClientDialog(false);
  };
  
  const validateClient = (clientId) => {
    // Update client status in the state
    const updatedClients = clients.map(client => 
      client.id === clientId 
        ? { ...client, status: 'validated' as const, kyc_level: client.kyc_level + 1 } 
        : client
    );
    
    setClients(updatedClients);
    setFilteredClients(updatedClients);
    
    toast({
      title: 'Client validé',
      description: 'Le client a été validé avec succès'
    });
  };
  
  const suspendClient = (clientId) => {
    // Update client status in the state
    const updatedClients = clients.map(client => 
      client.id === clientId 
        ? { ...client, status: 'suspended' as const } 
        : client
    );
    
    setClients(updatedClients);
    setFilteredClients(updatedClients);
    
    toast({
      title: 'Client suspendu',
      description: 'Le client a été suspendu'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Clients SFD</h1>
            <p className="text-muted-foreground">Gérez les clients de votre institution</p>
          </div>
          
          <Button onClick={() => setOpenNewClientDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Recherche de clients</CardTitle>
            <CardDescription>
              Recherchez des clients par nom, email, téléphone ou adresse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Liste des clients</CardTitle>
            <CardDescription>
              {filteredClients.length} client(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Chargement des clients...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Aucun client trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>
                          <div>{client.email}</div>
                          <div className="text-muted-foreground">{client.phone}</div>
                        </TableCell>
                        <TableCell>{client.address}</TableCell>
                        <TableCell>Niveau {client.kyc_level}</TableCell>
                        <TableCell>
                          {client.status === 'validated' && (
                            <Badge className="bg-green-100 text-green-800">Validé</Badge>
                          )}
                          {client.status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                          )}
                          {client.status === 'suspended' && (
                            <Badge className="bg-red-100 text-red-800">Suspendu</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(client.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {client.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => validateClient(client.id)}
                              >
                                <CircleCheck className="h-4 w-4 mr-1 text-green-600" />
                                Valider
                              </Button>
                            )}
                            
                            {client.status !== 'suspended' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => suspendClient(client.id)}
                              >
                                <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                                Suspendre
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/sfd-clients/${client.id}`)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* New Client Dialog */}
        <Dialog open={openNewClientDialog} onOpenChange={setOpenNewClientDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau Client</DialogTitle>
              <DialogDescription>
                Créez un nouveau client pour votre SFD. Remplissez tous les champs obligatoires.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={clientForm.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={clientForm.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={clientForm.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    value={clientForm.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="id_type">Type de pièce d'identité</Label>
                  <Select 
                    name="id_type" 
                    value={clientForm.id_type} 
                    onValueChange={(value) => handleSelectChange('id_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de pièce" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">Carte Nationale d'Identité</SelectItem>
                      <SelectItem value="passport">Passeport</SelectItem>
                      <SelectItem value="drivers_license">Permis de Conduire</SelectItem>
                      <SelectItem value="voter_card">Carte d'Électeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
                  <Input
                    id="id_number"
                    name="id_number"
                    value={clientForm.id_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={clientForm.notes}
                    onChange={handleInputChange}
                    placeholder="Informations supplémentaires sur le client..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenNewClientDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer le client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SfdClientsPage;
