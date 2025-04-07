
import React, { useEffect, useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock, Calendar, FileText, MapPin, Tag } from 'lucide-react';
import { SubsidyRequest } from '@/types/subsidyRequests';
import { format } from 'date-fns';

interface SubsidyRequestDetailsProps {
  requestId: string;
  onBack: () => void;
}

const SubsidyRequestDetails: React.FC<SubsidyRequestDetailsProps> = ({ requestId, onBack }) => {
  const { getSubsidyRequestById, getSubsidyRequestActivities } = useSubsidyRequests();
  const [request, setRequest] = useState<SubsidyRequest | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const requestData = await getSubsidyRequestById(requestId);
        if (requestData) {
          setRequest(requestData);
          const activitiesData = await getSubsidyRequestActivities(requestId);
          setActivities(activitiesData || []);
        } else {
          setError('Demande non trouvée');
        }
      } catch (err) {
        console.error('Error fetching subsidy request:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [requestId, getSubsidyRequestById, getSubsidyRequestActivities]);
  
  const getStatusBadge = (status: SubsidyRequest['status']) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejetée</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: SubsidyRequest['priority']) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="border-gray-300 text-gray-700">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="border-red-300 text-red-700">Urgente</Badge>;
    }
  };
  
  const formatPurpose = (purpose: string) => {
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
  
  const formatRegion = (region: string) => {
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
      default: return region;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <div className="h-8 w-8 mx-auto mb-4 rounded-full border-2 border-t-[#0D6A51] animate-spin" />
          <p className="text-sm text-gray-500">Chargement des détails de la demande...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !request) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{error || 'Demande non trouvée'}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux demandes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <div className="flex items-center space-x-2">
            {getPriorityBadge(request.priority)}
            {getStatusBadge(request.status)}
          </div>
        </div>
        <CardTitle className="mt-4">Demande de prêt MEREF</CardTitle>
        <CardDescription>
          <div className="flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            Soumise le {format(new Date(request.created_at), 'dd/MM/yyyy')}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Détails de la demande</h3>
            <span className="font-bold text-xl text-[#0D6A51]">{request.amount.toLocaleString()} FCFA</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Objet</p>
                <p className="text-sm">{formatPurpose(request.purpose)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Région ciblée</p>
                <p className="text-sm">{formatRegion(request.region || '')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Justification</h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm whitespace-pre-line">{request.justification}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Impact attendu</h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm whitespace-pre-line">{request.expected_impact}</p>
          </div>
        </div>
        
        {request.status === 'approved' || request.status === 'rejected' ? (
          <div>
            <h3 className="font-semibold mb-2">Réponse du MEREF</h3>
            <div className={`p-4 rounded-lg border ${request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              {request.status === 'approved' ? (
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-green-800">Demande approuvée</p>
                    {request.decision_comments && (
                      <p className="mt-2 text-sm whitespace-pre-line">{request.decision_comments}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-red-800">Demande rejetée</p>
                    {request.decision_comments ? (
                      <p className="mt-2 text-sm whitespace-pre-line">{request.decision_comments}</p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-600">Aucun commentaire fourni</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
        
        {activities.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Historique</h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 border rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-0.5">
                    {activity.activity_type.includes('created') && <FileText className="h-3 w-3" />}
                    {activity.activity_type.includes('approved') && <CheckCircle className="h-3 w-3 text-green-600" />}
                    {activity.activity_type.includes('rejected') && <XCircle className="h-3 w-3 text-red-600" />}
                    {activity.activity_type.includes('review') && <Clock className="h-3 w-3 text-blue-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.performed_at), 'dd/MM/yyyy à HH:mm')}
                    </p>
                    {activity.details && activity.details.comments && (
                      <p className="text-sm mt-1">
                        "{activity.details.comments}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour aux demandes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubsidyRequestDetails;
