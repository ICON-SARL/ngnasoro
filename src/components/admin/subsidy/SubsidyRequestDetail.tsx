
import React, { useState, useEffect } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, AlertTriangle, MessageCircle } from 'lucide-react';

export interface SubsidyRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

export function SubsidyRequestDetail({ requestId, onBack }: SubsidyRequestDetailProps) {
  const [request, setRequest] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [tab, setTab] = useState('details');
  const [priorityEdit, setPriorityEdit] = useState<string | null>(null);
  
  const { 
    getSubsidyRequestById,
    getSubsidyRequestActivities,
    updateSubsidyRequestStatus,
    updateSubsidyRequestPriority
  } = useSubsidyRequests();
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        const requestData = await getSubsidyRequestById(requestId);
        const activitiesData = await getSubsidyRequestActivities(requestId);
        
        setRequest(requestData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching request details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId, getSubsidyRequestById, getSubsidyRequestActivities]);
  
  const handleStatusChange = async (newStatus: 'pending' | 'under_review' | 'approved' | 'rejected') => {
    if (!request) return;
    
    await updateSubsidyRequestStatus.mutateAsync({
      requestId: request.id,
      status: newStatus,
      comments: comments
    });
    
    // Refresh the request data
    const updatedRequest = await getSubsidyRequestById(requestId);
    const updatedActivities = await getSubsidyRequestActivities(requestId);
    setRequest(updatedRequest);
    setActivities(updatedActivities);
    setComments('');
  };
  
  const handlePriorityUpdate = async () => {
    if (!request || !priorityEdit) return;
    
    await updateSubsidyRequestPriority.mutateAsync({
      requestId: request.id,
      priority: priorityEdit as any
    });
    
    // Refresh the request data
    const updatedRequest = await getSubsidyRequestById(requestId);
    setRequest(updatedRequest);
    setPriorityEdit(null);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
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
    switch (priority) {
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
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request_created':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'threshold_alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'request_under_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'request_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'request_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'priority_updated':
        return <AlertTriangle className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        
        <Card>
          <CardContent className="py-10 text-center">
            <p>Demande non trouvée ou erreur lors du chargement</p>
            <Button variant="outline" onClick={onBack} className="mt-4">
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(request.status)}
          {request.alert_triggered && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alerte
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Demande de Subvention</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priorité:</span>
                  {priorityEdit === null ? (
                    <>
                      {getPriorityBadge(request.priority)}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPriorityEdit(request.priority)}
                      >
                        Modifier
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={priorityEdit} 
                        onValueChange={setPriorityEdit}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="normal">Normale</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={handlePriorityUpdate}
                      >
                        Sauvegarder
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPriorityEdit(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="activities">Historique</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">SFD</h3>
                      <p className="font-medium">{request.sfd_name || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Région</h3>
                      <p>{request.region || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Date de demande</h3>
                      <p>{formatDate(request.created_at)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Montant</h3>
                      <p className="font-medium">{request.amount.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Objet</h3>
                    <p className="font-medium">{request.purpose}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Justification</h3>
                    <p className="bg-gray-50 p-3 rounded-md">{request.justification || 'Aucune justification fournie'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Impact attendu</h3>
                    <p className="bg-gray-50 p-3 rounded-md">{request.expected_impact || 'Non spécifié'}</p>
                  </div>
                  
                  {request.supporting_documents && request.supporting_documents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents justificatifs</h3>
                      <div className="flex flex-wrap gap-2">
                        {request.supporting_documents.map((doc: string, idx: number) => (
                          <Button key={idx} variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Document {idx + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Decision section */}
                  {request.status === 'approved' || request.status === 'rejected' ? (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-2">
                        {request.status === 'approved' ? 'Détails de l\'approbation' : 'Motif de rejet'}
                      </h3>
                      <p className="bg-gray-50 p-3 rounded-md">
                        {request.decision_comments || 'Aucun commentaire fourni'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {request.reviewed_at && `Décision prise le ${formatDate(request.reviewed_at)}`}
                      </p>
                    </div>
                  ) : (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-2">Actions</h3>
                      <div className="space-y-4">
                        <Textarea 
                          placeholder="Commentaires sur la décision..." 
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        />
                        
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <Button 
                              variant="outline"
                              onClick={() => handleStatusChange('under_review')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Marquer en cours d'examen
                            </Button>
                          )}
                          
                          {request.status !== 'approved' && (
                            <Button 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusChange('approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                          )}
                          
                          {request.status !== 'rejected' && (
                            <Button 
                              variant="destructive"
                              onClick={() => handleStatusChange('rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activities">
                  <div className="space-y-4">
                    {activities.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">Aucune activité enregistrée</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 border-b pb-3">
                          <div className="mt-1">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.description}</p>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {typeof activity.details === 'object' 
                                  ? JSON.stringify(activity.details) 
                                  : activity.details}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(activity.performed_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations SFD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Nom SFD</h3>
                <p className="font-medium">{request.sfd_name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Région</h3>
                <p>{request.region || 'Non spécifié'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Subventions précédentes</h3>
                <p>Données non disponibles</p>
                {/* This would be populated with real data in a production environment */}
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Historique des demandes</h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Approuvées:</span> Données non disponibles
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Rejetées:</span> Données non disponibles
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">En attente:</span> Données non disponibles
                  </div>
                </div>
                {/* This would be populated with real data in a production environment */}
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-1" />
                  Voir historique complet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
