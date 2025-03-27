
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
import { CheckCircle, XCircle, Eye, Building, Calendar, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define a proper type for our request object
type SfdRequest = {
  id: string;
  institutionName: string;
  region: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
};

// Mock data for demonstration
const mockRequests: SfdRequest[] = [
  {
    id: '1',
    institutionName: 'Kafo Jiginew',
    region: 'Sikasso',
    contactPerson: 'Fatoumata Koné',
    contactEmail: 'fatou@kafojiginew.ml',
    contactPhone: '+223 76 45 32 10',
    description: 'Kafo Jiginew est un réseau de caisses d\'épargne et de crédit mutuel au Mali. Nous servons principalement les agriculteurs dans la région de Sikasso.',
    status: 'pending',
    createdAt: '2023-10-15T09:30:00Z'
  },
  {
    id: '2',
    institutionName: 'Jemeni',
    region: 'Kayes',
    contactPerson: 'Ibrahim Touré',
    contactEmail: 'ibrahim@jemeni.ml',
    contactPhone: '+223 79 12 34 56',
    description: 'Jemeni est une institution de microfinance spécialisée dans le soutien aux femmes entrepreneures dans la région de Kayes.',
    status: 'approved',
    createdAt: '2023-10-10T14:45:00Z',
    approvedAt: '2023-10-12T08:15:00Z'
  },
  {
    id: '3',
    institutionName: 'Soro Yiriwaso',
    region: 'Mopti',
    contactPerson: 'Aminata Diallo',
    contactEmail: 'aminata@soroyiriwaso.ml',
    contactPhone: '+223 65 78 90 12',
    description: 'Soro Yiriwaso fournit des services financiers aux populations rurales de la région de Mopti, avec un focus sur les activités génératrices de revenus.',
    status: 'rejected',
    createdAt: '2023-10-05T11:20:00Z',
    rejectedAt: '2023-10-07T16:30:00Z'
  },
  {
    id: '4',
    institutionName: 'RMCR Mali',
    region: 'Ségou',
    contactPerson: 'Moussa Keita',
    contactEmail: 'moussa@rmcr.ml',
    contactPhone: '+223 64 32 10 98',
    description: 'Le Réseau de Micro-institutions de Croissance de Revenus (RMCR) est spécialisé dans le financement agricole dans la région de Ségou.',
    status: 'pending',
    createdAt: '2023-10-13T13:15:00Z'
  }
];

const SfdAccountRequests = () => {
  const [requests, setRequests] = useState<SfdRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<SfdRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleViewRequest = (request: SfdRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };
  
  const handleApproveRequest = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: 'approved' as const, approvedAt: new Date().toISOString() } 
        : req
    ));
    
    setIsDialogOpen(false);
    
    toast({
      title: "Demande approuvée",
      description: "Un compte administrateur SFD a été créé et les informations d'accès ont été envoyées.",
    });
  };
  
  const handleRejectRequest = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: 'rejected' as const, rejectedAt: new Date().toISOString() } 
        : req
    ));
    
    setIsDialogOpen(false);
    
    toast({
      title: "Demande rejetée",
      description: "Un email de notification a été envoyé au demandeur.",
    });
  };
  
  // Filter for pending requests
  const pendingRequests = requests.filter(req => req.status === 'pending');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Demandes de compte SFD en attente</CardTitle>
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            {pendingRequests.length} en attente
          </Badge>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune demande en attente pour le moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date de demande</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.institutionName}</TableCell>
                    <TableCell>{request.region}</TableCell>
                    <TableCell>{request.contactPerson}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Historique des demandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date de demande</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests
                .filter(req => req.status !== 'pending')
                .map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.institutionName}</TableCell>
                    <TableCell>{request.region}</TableCell>
                    <TableCell>
                      {request.status === 'approved' ? (
                        <Badge className="bg-green-50 text-green-700">Approuvée</Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-700">Rejetée</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Detail Dialog */}
      {selectedRequest && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
              <DialogDescription>
                Demande soumise le {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-3">
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">{selectedRequest.institutionName}</h3>
                  <p className="text-sm text-gray-500">{selectedRequest.region}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm">
                    Demande soumise le {new Date(selectedRequest.createdAt).toLocaleDateString()} 
                    à {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Contact</h4>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">Nom:</span>
                    <span>{selectedRequest.contactPerson}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{selectedRequest.contactEmail}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{selectedRequest.contactPhone}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>
              
              {selectedRequest.status === 'approved' && selectedRequest.approvedAt && (
                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-md text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Demande approuvée</p>
                    <p className="text-xs">
                      Le {new Date(selectedRequest.approvedAt).toLocaleDateString()} 
                      à {new Date(selectedRequest.approvedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedRequest.status === 'rejected' && selectedRequest.rejectedAt && (
                <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-md text-red-700">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Demande rejetée</p>
                    <p className="text-xs">
                      Le {new Date(selectedRequest.rejectedAt).toLocaleDateString()} 
                      à {new Date(selectedRequest.rejectedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedRequest.status === 'pending' && (
              <DialogFooter className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
                <Button 
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approuver
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SfdAccountRequests;
