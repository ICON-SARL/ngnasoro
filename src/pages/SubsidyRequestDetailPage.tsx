import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  FileText,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AuditLogCategory, AuditLogSeverity, logAuditEvent } from '@/utils/audit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PermissionGuard from '@/components/PermissionGuard';
import { Permission } from '@/utils/audit/auditPermissions';

interface SubsidyRequest {
  id: string;
  sfd_id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  justification: string;
  region: string;
  created_at: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  requested_by: string;
  requester_name?: string;
  supporting_documents?: string[];
  expected_impact?: string;
  decision_comments?: string | null;
  alert_triggered: boolean;
}

interface ActivityLog {
  id: string;
  activity_type: string;
  description: string;
  performed_at: string;
  performed_by: string;
  performer_name?: string;
  details?: any;
}

const SubsidyRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<SubsidyRequest | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequestDetails() {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data: requestData, error: requestError } = await supabase
          .from('subsidy_requests')
          .select(`
            *,
            sfds:sfd_id (id, name)
          `)
          .eq('id', id)
          .single();
        
        if (requestError) throw requestError;
        
        let requesterName = 'Unknown User';
        if (requestData.requested_by) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', requestData.requested_by)
            .single();
          
          if (!userError && userData) {
            requesterName = userData.full_name || requesterName;
          }
        }
        
        const typedStatus = requestData.status as 'pending' | 'under_review' | 'approved' | 'rejected';
        const typedPriority = requestData.priority as 'low' | 'normal' | 'high' | 'urgent';
        
        const typedRequest: SubsidyRequest = {
          ...requestData,
          sfd_name: requestData.sfds?.name || 'Unknown SFD',
          requester_name: requesterName,
          status: typedStatus,
          priority: typedPriority,
          alert_triggered: !!requestData.alert_triggered
        };
        
        setRequest(typedRequest);
      } catch (error) {
        console.error('Error fetching subsidy request:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la demande",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    async function fetchActivities() {
      if (!id) return;
      
      setIsActivitiesLoading(true);
      try {
        const { data, error } = await supabase
          .from('subsidy_request_activities')
          .select('*')
          .eq('request_id', id)
          .order('performed_at', { ascending: false });
        
        if (error) throw error;
        
        const activitiesWithNames = await Promise.all(data.map(async (activity) => {
          let performerName = 'Unknown User';
          
          if (activity.performed_by) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', activity.performed_by)
              .single();
            
            if (!userError && userData) {
              performerName = userData.full_name || performerName;
            }
          }
          
          return {
            ...activity,
            performer_name: performerName
          };
        }));
        
        setActivities(activitiesWithNames);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsActivitiesLoading(false);
      }
    }
    
    fetchRequestDetails();
    fetchActivities();
  }, [id, toast]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800">Haute</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">Normale</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Basse</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En cours d'examen</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'approved',
          decision_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);
      
      if (error) throw error;
      
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: request.id,
          activity_type: 'request_approved',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          description: 'Subsidy request approved',
          details: comments ? { comments } : null
        });
      
      await logAuditEvent({
        user_id: (await supabase.auth.getUser()).data.user?.id || 'unknown',
        action: 'approve_subsidy_request',
        category: AuditLogCategory.SUBSIDY_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        target_resource: `subsidy_request/${request.id}`,
        details: {
          sfd_id: request.sfd_id,
          sfd_name: request.sfd_name,
          amount: request.amount
        }
      });
      
      toast({
        title: "Demande approuvée",
        description: "La demande de subvention a été approuvée avec succès"
      });
      
      navigate('/super-admin?tab=subsidy_requests');
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation de la demande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!request) return;
    
    if (!comments.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez fournir une raison pour le rejet de la demande",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'rejected',
          decision_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);
      
      if (error) throw error;
      
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: request.id,
          activity_type: 'request_rejected',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          description: 'Subsidy request rejected',
          details: { comments }
        });
      
      await logAuditEvent({
        user_id: (await supabase.auth.getUser()).data.user?.id || 'unknown',
        action: 'reject_subsidy_request',
        category: AuditLogCategory.SUBSIDY_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        target_resource: `subsidy_request/${request.id}`,
        details: {
          sfd_id: request.sfd_id,
          sfd_name: request.sfd_name,
          amount: request.amount,
          reason: comments
        }
      });
      
      toast({
        title: "Demande rejetée",
        description: "La demande de subvention a été rejetée"
      });
      
      navigate('/super-admin?tab=subsidy_requests');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet de la demande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReview = async () => {
    if (!request) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'under_review',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);
      
      if (error) throw error;
      
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: request.id,
          activity_type: 'request_under_review',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          description: 'Subsidy request marked as under review'
        });
      
      await logAuditEvent({
        user_id: (await supabase.auth.getUser()).data.user?.id || 'unknown',
        action: 'review_subsidy_request',
        category: AuditLogCategory.SUBSIDY_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        target_resource: `subsidy_request/${request.id}`,
        details: {
          sfd_id: request.sfd_id,
          sfd_name: request.sfd_name,
          amount: request.amount
        }
      });
      
      setRequest(prev => prev ? { ...prev, status: 'under_review' } : null);
      
      toast({
        title: "En cours d'examen",
        description: "La demande est maintenant marquée comme étant en cours d'examen"
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SuperAdminHeader />
        <main className="container mx-auto p-4 md:p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SuperAdminHeader />
        <main className="container mx-auto p-4 md:p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <h1 className="text-xl font-bold">Demande introuvable</h1>
          </div>
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-lg font-medium mb-2">Demande non trouvée</h2>
                <p className="text-muted-foreground mb-4">
                  La demande de subvention que vous recherchez n'existe pas ou a été supprimée.
                </p>
                <Button onClick={() => navigate('/super-admin?tab=subsidy_requests')}>
                  Voir toutes les demandes
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission={Permission.MANAGE_SUBSIDIES}>
      <div className="min-h-screen bg-gray-50">
        <SuperAdminHeader />
        <main className="container mx-auto p-4 md:p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <h1 className="text-xl font-bold">Demande de Subvention</h1>
            <div className="ml-auto flex items-center gap-2">
              {getStatusBadge(request.status)}
              {getPriorityBadge(request.priority)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Détails de la demande</span>
                    <span className="text-lg font-bold text-[#0D6A51]">
                      {formatAmount(request.amount)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Objet de la demande</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded">{request.purpose}</p>
                    </div>
                    
                    {request.justification && (
                      <div>
                        <h3 className="font-medium mb-2">Justification</h3>
                        <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-line">
                          {request.justification}
                        </p>
                      </div>
                    )}
                    
                    {request.expected_impact && (
                      <div>
                        <h3 className="font-medium mb-2">Impact attendu</h3>
                        <p className="text-sm bg-gray-50 p-3 rounded">
                          {request.expected_impact}
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'pending' && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-2">Commentaires (optionnel pour approbation, obligatoire pour rejet)</h3>
                          <Textarea
                            placeholder="Ajoutez vos commentaires concernant cette demande..."
                            className="min-h-[100px]"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex justify-between pt-2">
                          <Button
                            variant="outline"
                            onClick={handleReview}
                            disabled={isSubmitting}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Marquer en cours d'examen
                          </Button>
                          
                          <div className="space-x-2">
                            <Button
                              variant="destructive"
                              onClick={handleReject}
                              disabled={isSubmitting}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                            <Button
                              variant="default"
                              onClick={handleApprove}
                              disabled={isSubmitting}
                              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {request.status === 'under_review' && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-2">Commentaires (optionnel pour approbation, obligatoire pour rejet)</h3>
                          <Textarea
                            placeholder="Ajoutez vos commentaires concernant cette demande..."
                            className="min-h-[100px]"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex justify-end pt-2 space-x-2">
                          <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isSubmitting}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                          <Button
                            variant="default"
                            onClick={handleApprove}
                            disabled={isSubmitting}
                            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {(request.status === 'approved' || request.status === 'rejected') && request.decision_comments && (
                      <>
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-2">Commentaires de décision</h3>
                          <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-line">
                            {request.decision_comments}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="activities">
                <TabsList>
                  <TabsTrigger value="activities">Historique des activités</TabsTrigger>
                  <TabsTrigger value="documents">Documents justificatifs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activities">
                  <Card>
                    <CardContent className="pt-6">
                      {isActivitiesLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>Aucune activité enregistrée</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities.map((activity) => (
                            <div key={activity.id} className="border-l-2 border-gray-200 pl-4 pb-2">
                              <div className="text-sm">
                                <span className="font-medium">{activity.performer_name}</span>
                                {' '}
                                <span className="text-muted-foreground">
                                  {activity.description || getActivityDescription(activity.activity_type)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(activity.performed_at)} à {new Date(activity.performed_at).toLocaleTimeString('fr-FR')}
                              </div>
                              {activity.details && activity.details.comments && (
                                <div className="text-sm mt-1 bg-gray-50 p-2 rounded text-muted-foreground">
                                  "{activity.details.comments}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="documents">
                  <Card>
                    <CardContent className="pt-6">
                      {request.supporting_documents && request.supporting_documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {request.supporting_documents.map((doc, index) => (
                            <div key={index} className="border rounded p-3 flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-2" />
                              <div className="flex-1 overflow-hidden">
                                <div className="truncate text-sm font-medium">Document {index + 1}</div>
                                <div className="text-xs text-blue-500 truncate">{doc}</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>Aucun document joint à cette demande</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations sur la SFD</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Building className="h-4 w-4 mt-0.5 mr-2 text-[#0D6A51]" />
                      <div>
                        <div className="font-medium">{request.sfd_name}</div>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs"
                          onClick={() => navigate(`/sfds/${request.sfd_id}`)}
                        >
                          Voir le profil SFD
                        </Button>
                      </div>
                    </div>
                    
                    {request.region && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mt-0.5 mr-2 text-[#0D6A51]" />
                        <div>
                          <div className="text-sm text-muted-foreground">Région</div>
                          <div>{request.region}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mt-0.5 mr-2 text-[#0D6A51]" />
                      <div>
                        <div className="text-sm text-muted-foreground">Date de demande</div>
                        <div>{formatDate(request.created_at)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="h-4 w-4 mt-0.5 mr-2 text-[#0D6A51]" />
                      <div>
                        <div className="text-sm text-muted-foreground">Demandé par</div>
                        <div>{request.requester_name}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subventions précédentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <PreviousSubsidies sfdId={request.sfd_id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
};

function getActivityDescription(activityType: string): string {
  switch (activityType) {
    case 'request_created':
      return 'a créé la demande';
    case 'request_under_review':
      return 'a marqué la demande comme étant en cours d\'examen';
    case 'request_approved':
      return 'a approuvé la demande';
    case 'request_rejected':
      return 'a rejeté la demande';
    case 'threshold_alert':
      return 'a déclenché une alerte de seuil';
    default:
      return activityType;
  }
}

interface PreviousSubsidiesProps {
  sfdId: string;
}

function PreviousSubsidies({ sfdId }: PreviousSubsidiesProps) {
  const [subsidies, setSubsidies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPreviousSubsidies() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sfd_subsidies')
          .select('*')
          .eq('sfd_id', sfdId)
          .order('allocated_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setSubsidies(data);
      } catch (error) {
        console.error('Error fetching previous subsidies:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPreviousSubsidies();
  }, [sfdId]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }
  
  if (subsidies.length === 0) {
    return (
      <div className="text-center py-2 text-muted-foreground text-sm">
        <p>Aucune subvention précédente</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {subsidies.map((subsidy) => (
        <div key={subsidy.id} className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Badge 
              variant="outline" 
              className={
                subsidy.status === 'active' 
                  ? 'bg-green-50 text-green-700' 
                  : subsidy.status === 'depleted' 
                  ? 'bg-gray-50 text-gray-700'
                  : 'bg-amber-50 text-amber-700'
              }
            >
              {subsidy.status}
            </Badge>
            <span className="ml-2">
              {new Date(subsidy.allocated_at).toLocaleDateString()}
            </span>
          </div>
          <div className="font-medium">
            {formatAmount(subsidy.amount)}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button variant="link" className="p-0 h-auto w-full text-center text-xs">
          Voir toutes les subventions
        </Button>
      </div>
    </div>
  );
}

export default SubsidyRequestDetailPage;
