
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  Loader2,
  MapPin,
  Tag,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubsidyRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

export function SubsidyRequestDetail({ requestId, onBack }: SubsidyRequestDetailProps) {
  const { 
    getSubsidyRequestById, 
    getSubsidyRequestActivities, 
    updateSubsidyRequestStatus,
    updateSubsidyRequestPriority
  } = useSubsidyRequests();
  const [request, setRequest] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [decisionComments, setDecisionComments] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const requestData = await getSubsidyRequestById(requestId);
        if (requestData) {
          setRequest(requestData);
          const activitiesData = await getSubsidyRequestActivities(requestId);
          setActivities(activitiesData || []);
        }
      } catch (error) {
        console.error('Error fetching subsidy request details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestId, getSubsidyRequestById, getSubsidyRequestActivities]);

  const handleUpdateStatus = async (status: 'pending' | 'under_review' | 'approved' | 'rejected') => {
    if (!request) return;
    
    setStatusUpdateLoading(true);
    try {
      await updateSubsidyRequestStatus.mutateAsync({
        requestId: request.id,
        status,
        comments: decisionComments
      });
      
      // Reload the request data after status update
      const updatedRequest = await getSubsidyRequestById(requestId);
      setRequest(updatedRequest);
      
      // Reload activities
      const updatedActivities = await getSubsidyRequestActivities(requestId);
      setActivities(updatedActivities || []);
      
      // Clear comments after submission
      setDecisionComments('');
    } catch (error) {
      console.error('Error updating request status:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  
  const handleUpdatePriority = async (priority: 'low' | 'normal' | 'high' | 'urgent') => {
    if (!request) return;
    
    try {
      await updateSubsidyRequestPriority.mutateAsync({
        requestId: request.id,
        priority
      });
      
      // Reload the request data after priority update
      const updatedRequest = await getSubsidyRequestById(requestId);
      setRequest(updatedRequest);
      
      // Reload activities
      const updatedActivities = await getSubsidyRequestActivities(requestId);
      setActivities(updatedActivities || []);
    } catch (error) {
      console.error('Error updating request priority:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejetée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="border-gray-300 text-gray-700">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="border-red-300 text-red-700">Urgente</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };
  
  const getPurposeName = (purpose: string) => {
    switch(purpose) {
      case 'agriculture': return 'Agriculture';
      case 'women_empowerment': return 'Autonomisation des femmes';
      case 'youth_employment': return 'Emploi des jeunes';
      case 'small_business': return 'Petites entreprises';
      case 'microfinance': return 'Expansion des activités de microfinance';
      case 'other': return 'Autre';
      default: return purpose;
    }
  };
  
  const getRegionName = (region: string) => {
    switch(region) {
      case 'dakar': return 'Dakar';
      case 'thies': return 'Thiès';
      case 'saint_louis': return 'Saint-Louis';
      case 'ziguinchor': return 'Ziguinchor';
      case 'kaolack': return 'Kaolack';
      case 'ouagadougou': return 'Ouagadougou';
      case 'abidjan': return 'Abidjan';
      case 'lome': return 'Lomé';
      case 'nationwide': return 'Nationale';
      default: return region || 'Non spécifiée';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#0D6A51]" />
          <p className="text-sm text-gray-600">Chargement des détails...</p>
        </div>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <p className="font-medium mb-2">Demande non trouvée</p>
          <p className="text-sm text-gray-600 mb-4">La demande que vous cherchez n'existe pas ou a été supprimée.</p>
          <Button onClick={onBack}>Retour à la liste</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onBack} className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          
          <div className="flex items-center space-x-2">
            {request.alert_triggered && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" /> 
                Seuil d'alerte
              </Badge>
            )}
            {getPriorityBadge(request.priority)}
            {getStatusBadge(request.status)}
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Demande de prêt MEREF</h2>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Soumise le {format(new Date(request.created_at), 'dd MMMM yyyy', { locale: fr })}
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0D6A51]">{request.amount.toLocaleString()} FCFA</div>
          </div>
          
          <div className="flex items-center mt-4 bg-gray-50 p-3 rounded-lg">
            <div className="bg-[#0D6A51]/10 h-10 w-10 rounded-full flex items-center justify-center mr-3">
              <Building className="h-5 w-5 text-[#0D6A51]" />
            </div>
            <div>
              <div className="font-medium">{request.sfd_name || 'SFD inconnue'}</div>
              <div className="text-sm text-gray-500">Institution demandeuse</div>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">
              <Info className="h-4 w-4 mr-2" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Clock className="h-4 w-4 mr-2" />
              Activités
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Objet du prêt</p>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{getPurposeName(request.purpose)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Région ciblée</p>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{getRegionName(request.region)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Justification</p>
              <div className="bg-gray-50 p-4 rounded-md border text-sm whitespace-pre-line">
                {request.justification || 'Aucune justification fournie.'}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Impact attendu</p>
              <div className="bg-gray-50 p-4 rounded-md border text-sm whitespace-pre-line">
                {request.expected_impact || 'Aucun impact attendu spécifié.'}
              </div>
            </div>
            
            {(request.status === 'approved' || request.status === 'rejected') && request.decision_comments && (
              <div>
                <p className="text-sm font-medium mb-2">Commentaires de décision</p>
                <div className={`p-4 rounded-md border text-sm whitespace-pre-line ${
                  request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {request.decision_comments}
                </div>
              </div>
            )}
            
            {request.status !== 'approved' && request.status !== 'rejected' && (
              <div className="space-y-4 mt-6 p-4 border rounded-md">
                <h3 className="font-medium">Prendre une décision</h3>
                
                <Textarea
                  placeholder="Ajouter des commentaires pour accompagner votre décision..."
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
                />
                
                <div className="flex flex-wrap gap-2">
                  {request.status !== 'under_review' && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus('under_review')}
                      disabled={statusUpdateLoading}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Marquer en cours d'examen
                    </Button>
                  )}
                  
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={statusUpdateLoading}
                  >
                    {statusUpdateLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approuver
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={statusUpdateLoading}
                  >
                    {statusUpdateLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Rejeter
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-4 mt-2 p-4 border rounded-md">
              <h3 className="font-medium">Gérer la priorité</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={request.priority === 'low' ? 'default' : 'outline'}
                  onClick={() => handleUpdatePriority('low')}
                  size="sm"
                >
                  Basse
                </Button>
                <Button
                  variant={request.priority === 'normal' ? 'default' : 'outline'}
                  onClick={() => handleUpdatePriority('normal')}
                  size="sm"
                >
                  Normale
                </Button>
                <Button
                  variant={request.priority === 'high' ? 'default' : 'outline'}
                  onClick={() => handleUpdatePriority('high')}
                  size="sm"
                >
                  Haute
                </Button>
                <Button
                  variant={request.priority === 'urgent' ? 'default' : 'outline'}
                  onClick={() => handleUpdatePriority('urgent')}
                  size="sm"
                >
                  Urgente
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activities">
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune activité enregistrée pour cette demande.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex p-3 border rounded-md">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {activity.activity_type.includes('created') && <FileText className="h-4 w-4" />}
                      {activity.activity_type.includes('approved') && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.activity_type.includes('rejected') && <XCircle className="h-4 w-4 text-red-600" />}
                      {activity.activity_type.includes('review') && <Clock className="h-4 w-4 text-blue-600" />}
                      {activity.activity_type.includes('priority') && <Info className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(activity.performed_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </div>
                      {activity.details && activity.details.comments && (
                        <div className="text-sm mt-1 bg-gray-50 p-2 rounded">
                          {activity.details.comments}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
