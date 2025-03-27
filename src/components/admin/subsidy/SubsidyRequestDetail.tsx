
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  Building, 
  User, 
  CalendarClock, 
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { SubsidyRequest, SubsidyRequestActivity } from '@/types/subsidyRequests';

interface SubsidyRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

export function SubsidyRequestDetail({ requestId, onBack }: SubsidyRequestDetailProps) {
  const [request, setRequest] = useState<SubsidyRequest | null>(null);
  const [activities, setActivities] = useState<SubsidyRequestActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decisionComments, setDecisionComments] = useState('');
  
  const { 
    getSubsidyRequestById, 
    getSubsidyRequestActivities,
    updateSubsidyRequestStatus
  } = useSubsidyRequests();
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const requestData = await getSubsidyRequestById(requestId);
        const activitiesData = await getSubsidyRequestActivities(requestId);
        
        if (requestData) {
          setRequest(requestData);
          setDecisionComments(requestData.decision_comments || '');
        }
        
        if (activitiesData) {
          setActivities(activitiesData);
        }
      } catch (error) {
        console.error('Error fetching request details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [requestId, getSubsidyRequestById, getSubsidyRequestActivities]);
  
  const handleStatusChange = (status: 'pending' | 'under_review' | 'approved' | 'rejected') => {
    if (!request) return;
    
    updateSubsidyRequestStatus.mutate({
      requestId: request.id,
      status,
      comments: decisionComments
    }, {
      onSuccess: () => {
        // Refresh the request data
        getSubsidyRequestById(requestId).then(data => {
          if (data) {
            setRequest(data);
          }
        });
        
        // Refresh activities
        getSubsidyRequestActivities(requestId).then(data => {
          if (data) {
            setActivities(data);
          }
        });
      }
    });
  };
  
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
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800">Haute</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">Normale</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Basse</Badge>;
      default:
        return <Badge>Inconnue</Badge>;
    }
  };
  
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'request_created':
        return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case 'request_under_review':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'request_approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'request_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'threshold_alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'priority_updated':
        return <CalendarClock className="h-4 w-4 text-purple-500" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (isLoading || !request) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Chargement des détails...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0D6A51]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              Demande de subvention - {request.sfd_name}
              {request.alert_triggered && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </CardTitle>
            <CardDescription>
              Détails et historique de la demande de subvention
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Institution SFD</h3>
                  <div className="flex items-center mt-1">
                    <div className="h-8 w-8 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                      <Building className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{request.sfd_name}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Montant demandé</h3>
                  <p className="text-2xl font-bold mt-1">{request.amount.toLocaleString()} FCFA</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Objet de la demande</h3>
                  <p className="mt-1">{request.purpose}</p>
                </div>
                
                {request.justification && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Justification</h3>
                    <p className="mt-1 text-sm">{request.justification}</p>
                  </div>
                )}
                
                {request.expected_impact && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Impact attendu</h3>
                    <p className="mt-1 text-sm">{request.expected_impact}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <div className="mt-1">{getStatusBadge(request.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Priorité</h3>
                    <div className="mt-1">{getPriorityBadge(request.priority)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de demande</h3>
                    <p className="mt-1">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  {request.region && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Région</h3>
                      <p className="mt-1">{request.region}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Commentaires de décision</h3>
                  <Textarea
                    placeholder="Entrez des commentaires sur la décision..."
                    className="mt-2"
                    value={decisionComments}
                    onChange={(e) => setDecisionComments(e.target.value)}
                    disabled={request.status === 'approved' || request.status === 'rejected'}
                  />
                </div>
                
                {(request.status === 'pending' || request.status === 'under_review') && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleStatusChange('rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                    
                    <Button
                      className="flex-1"
                      onClick={() => handleStatusChange('approved')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  </div>
                )}
                
                {request.alert_triggered && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Alerte de seuil</h4>
                        <p className="text-sm text-amber-700">
                          Cette demande a déclenché une alerte car son montant dépasse un seuil prédéfini.
                          Veuillez examiner attentivement avant d'approuver.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="font-medium">Historique des activités</h3>
              
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune activité enregistrée</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start border-l-2 border-gray-200 pl-4 pb-4"
                    >
                      <div className="flex-shrink-0 mr-3">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.description}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.performed_at).toLocaleString()}
                          </span>
                        </div>
                        
                        {activity.details && (
                          <div className="text-sm text-gray-600 mt-1">
                            {activity.activity_type === 'threshold_alert' ? (
                              <p>
                                Seuil d'alerte: {activity.details.threshold_amount?.toLocaleString()} FCFA
                              </p>
                            ) : activity.details.comments ? (
                              <p>Commentaire: {activity.details.comments}</p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-5">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
        
        {request.status === 'pending' && (
          <Button 
            variant="secondary"
            onClick={() => handleStatusChange('under_review')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Marquer en cours d'examen
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
