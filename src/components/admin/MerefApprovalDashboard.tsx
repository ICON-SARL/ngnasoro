
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search,
  FileText,
  Eye,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { merefSfdIntegration, MerefApprovalRequest } from '@/utils/merefSfdIntegration';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RequestItem {
  id: string;
  sfd_id: string;
  sfd_name: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  status: string;
  created_at: string;
  requested_by: string;
  priority?: string;
}

export function MerefApprovalDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch pending requests when the tab changes
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('subsidy_requests')
          .select('*, sfds(name)');
          
        // Filter based on active tab
        if (activeTab === 'pending') {
          query = query.eq('status', 'pending');
        } else if (activeTab === 'under_review') {
          query = query.eq('status', 'under_review');
        } else if (activeTab === 'approved') {
          query = query.eq('status', 'approved');
        } else if (activeTab === 'rejected') {
          query = query.eq('status', 'rejected');
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formattedRequests = data.map(item => ({
            id: item.id,
            sfd_id: item.sfd_id,
            sfd_name: item.sfds?.name || 'SFD Inconnue',
            type: 'subsidy',
            title: item.purpose || 'Demande de subvention',
            description: item.justification || '',
            amount: item.amount,
            status: item.status,
            created_at: item.created_at,
            requested_by: item.requested_by,
            priority: item.priority
          }));
          
          setRequests(formattedRequests);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [activeTab]);
  
  // Filter requests based on search term
  const filteredRequests = requests.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.sfd_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle request approval
  const handleApprove = async () => {
    if (!selectedRequest || !user) return;
    
    try {
      const approvalRequest: MerefApprovalRequest = {
        requestId: selectedRequest.id,
        sfdId: selectedRequest.sfd_id,
        requestType: selectedRequest.type as 'loan' | 'subsidy' | 'client_registration',
        status: 'approved',
        comments: comments,
        reviewedBy: user.id
      };
      
      const result = await merefSfdIntegration.processMerefApproval(approvalRequest);
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'approbation');
      }
      
      // Update the local state
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      
      toast({
        title: "Succès",
        description: "La demande a été approuvée avec succès"
      });
      
      setShowApproveDialog(false);
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande",
        variant: "destructive"
      });
    }
  };
  
  // Handle request rejection
  const handleReject = async () => {
    if (!selectedRequest || !user) return;
    
    try {
      const rejectionRequest: MerefApprovalRequest = {
        requestId: selectedRequest.id,
        sfdId: selectedRequest.sfd_id,
        requestType: selectedRequest.type as 'loan' | 'subsidy' | 'client_registration',
        status: 'rejected',
        comments: comments,
        reviewedBy: user.id
      };
      
      const result = await merefSfdIntegration.processMerefApproval(rejectionRequest);
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors du rejet');
      }
      
      // Update the local state
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      
      toast({
        title: "Information",
        description: "La demande a été rejetée"
      });
      
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive"
      });
    }
  };
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format the amount
  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Basse</Badge>;
      case 'normal':
        return <Badge className="bg-gray-100 text-gray-800">Normale</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800">Haute</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Approbations MEREF</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les demandes d'approbation provenant des SFDs
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par titre ou SFD..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            En attente ({requests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="under_review">
            En examen ({requests.filter(r => r.status === 'under_review').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées
          </TabsTrigger>
          <TabsTrigger value="all">
            Toutes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                Demandes {activeTab === 'pending' ? 'en attente' : 
                          activeTab === 'under_review' ? 'en cours d\'examen' :
                          activeTab === 'approved' ? 'approuvées' :
                          activeTab === 'rejected' ? 'rejetées' : ''}
              </CardTitle>
              <CardDescription>
                {activeTab === 'pending' ? 'Demandes nécessitant une approbation du MEREF' : 
                 activeTab === 'under_review' ? 'Demandes en cours d\'examen par le MEREF' :
                 activeTab === 'approved' ? 'Demandes approuvées par le MEREF' :
                 activeTab === 'rejected' ? 'Demandes rejetées par le MEREF' : 
                 'Toutes les demandes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-60">
                  <div className="flex flex-col items-center">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground animate-pulse" />
                    <p className="mt-2 text-muted-foreground">Chargement des demandes...</p>
                  </div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex items-center justify-center h-60">
                  <div className="flex flex-col items-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Aucune demande trouvée</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SFD</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            Montant
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            Date
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.sfd_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.type === 'subsidy' ? 'Subvention' : 
                               request.type === 'loan' ? 'Prêt' : 
                               request.type === 'client_registration' ? 'Client' : 
                               request.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>{formatAmount(request.amount)}</TableCell>
                          <TableCell>{formatDate(request.created_at)}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/approval-details/${request.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowApproveDialog(true);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Approve Dialog */}
      {showApproveDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Approuver la demande</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Vous êtes sur le point d'approuver la demande de <strong>{selectedRequest.sfd_name}</strong> pour <strong>{selectedRequest.title}</strong>
              {selectedRequest.amount ? ` (${formatAmount(selectedRequest.amount)})` : ''}.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Commentaires (optionnel)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Ajouter des commentaires sur cette approbation..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApproveDialog(false);
                  setSelectedRequest(null);
                  setComments('');
                }}
              >
                Annuler
              </Button>
              
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmer l'approbation
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Dialog */}
      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Rejeter la demande</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Vous êtes sur le point de rejeter la demande de <strong>{selectedRequest.sfd_name}</strong> pour <strong>{selectedRequest.title}</strong>
              {selectedRequest.amount ? ` (${formatAmount(selectedRequest.amount)})` : ''}.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Motif du rejet (requis)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Veuillez indiquer le motif du rejet..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setComments('');
                }}
              >
                Annuler
              </Button>
              
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
                disabled={!comments.trim()}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
