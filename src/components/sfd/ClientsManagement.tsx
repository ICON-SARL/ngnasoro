
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  Plus,
  Search,
  FileText,
  Upload,
  Shield,
  Clock,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';
import { useToast } from '@/hooks/use-toast';
import ClientDetails from './ClientDetails';
import ClientDocuments from './ClientDocuments';
import { NewClientForm } from './NewClientForm';
import { useClientAccountOperations } from '@/components/admin/hooks/sfd-client/useClientAccountOperations';

const ClientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<SfdClient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [validationNotes, setValidationNotes] = useState('');
  
  const { clients, isLoading, validateClient, rejectClient } = useSfdClients();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleViewClient = (client: SfdClient) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
    setActiveTab('details');
    setValidationNotes('');
  };
  
  const handleValidateClient = () => {
    if (!selectedClient) return;
    
    validateClient.mutate({
      clientId: selectedClient.id
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast({
          title: "Compte validé",
          description: "Le compte client a été validé avec succès",
        });
      }
    });
  };
  
  const handleRejectClient = () => {
    if (!selectedClient) return;
    
    rejectClient.mutate({
      clientId: selectedClient.id
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast({
          title: "Compte rejeté",
          description: "Le compte client a été rejeté",
        });
      }
    });
  };

  const handleClientDeleted = () => {
    setIsDialogOpen(false);
  };
  
  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );
  
  const pendingClients = filteredClients.filter(client => client.status === 'pending');
  const validatedClients = filteredClients.filter(client => client.status === 'validated');
  const rejectedClients = filteredClients.filter(client => client.status === 'rejected');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-green-50 text-green-700">Validé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button 
          onClick={() => setIsNewClientDialogOpen(true)}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau Client
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher par nom, email ou téléphone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            En attente <Badge variant="outline" className="ml-2">{pendingClients.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="validated" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Validés <Badge variant="outline" className="ml-2">{validatedClients.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            Rejetés <Badge variant="outline" className="ml-2">{rejectedClients.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <ClientsTable 
            clients={pendingClients} 
            onViewClient={handleViewClient}
            isLoading={isLoading}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        
        <TabsContent value="validated">
          <ClientsTable 
            clients={validatedClients} 
            onViewClient={handleViewClient}
            isLoading={isLoading}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        
        <TabsContent value="rejected">
          <ClientsTable 
            clients={rejectedClients} 
            onViewClient={handleViewClient}
            isLoading={isLoading}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
      
      {selectedClient && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Détails du Client</DialogTitle>
              <DialogDescription>
                Dossier créé le {new Date(selectedClient.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details">
                  <User className="h-4 w-4 mr-1" /> Informations
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-1" /> Documents
                </TabsTrigger>
                {selectedClient.status === 'pending' && (
                  <TabsTrigger value="validation">
                    <Shield className="h-4 w-4 mr-1" /> Validation
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="details">
                <ClientDetails client={selectedClient} onDeleted={handleClientDeleted} />
              </TabsContent>
              
              <TabsContent value="documents">
                <ClientDocuments clientId={selectedClient.id} />
              </TabsContent>
              
              {selectedClient.status === 'pending' && (
                <TabsContent value="validation">
                  <div className="space-y-4 py-4">
                    <div className="bg-amber-50 p-4 rounded-md flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Validation de compte client</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          Veuillez examiner attentivement les informations et documents du client avant de valider ou rejeter son compte.
                          La validation donnera accès aux services financiers de votre SFD.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="validation-notes">Notes de validation</Label>
                      <Textarea 
                        id="validation-notes"
                        placeholder="Ajoutez des notes sur cette validation..."
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
            
            <DialogFooter>
              {selectedClient.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleRejectClient}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button 
                    onClick={handleValidateClient}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valider
                  </Button>
                </>
              )}
              {selectedClient.status !== 'pending' && (
                <Button onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte client pour votre SFD
            </DialogDescription>
          </DialogHeader>
          
          <NewClientForm onSuccess={() => setIsNewClientDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ClientsTableProps {
  clients: SfdClient[];
  onViewClient: (client: SfdClient) => void;
  isLoading: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ClientsTable = ({ clients, onViewClient, isLoading, getStatusBadge }: ClientsTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Chargement des clients...</div>;
  }
  
  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun client trouvé dans cette catégorie.
      </div>
    );
  }

  const validatedClientIds = clients
    .filter(client => client.status === 'validated')
    .map(client => client.id);

  const ClientBalance = ({ clientId }: { clientId: string }) => {
    const { balance, currency, isLoading } = useClientAccountOperations(clientId);
    
    if (isLoading) {
      return <div className="text-sm">Chargement...</div>;
    }

    return (
      <div className="flex items-center text-sm">
        <Wallet className="h-3 w-3 mr-1 text-gray-500" />
        <span>{new Intl.NumberFormat('fr-FR').format(balance)} {currency}</span>
      </div>
    );
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom complet</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Date de création</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.full_name}</TableCell>
            <TableCell>
              <div className="flex flex-col space-y-1">
                {client.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1 text-gray-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-1 text-gray-500" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.status === 'validated' && (
                  <ClientBalance clientId={client.id} />
                )}
              </div>
            </TableCell>
            <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{getStatusBadge(client.status)}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewClient(client)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientsManagement;
