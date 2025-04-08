
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  History,
  Send,
  Clock,
  BadgeDollarSign
} from 'lucide-react';

interface SubsidyRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

export function SubsidyRequestDetail({
  requestId,
  onBack
}: SubsidyRequestDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  
  // Récupérer les détails de la demande
  const { data: request, isLoading } = useQuery({
    queryKey: ['subsidy-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds (id, name, code),
          subsidy_request_activities (
            id, 
            activity_type, 
            description, 
            performed_at, 
            profiles:performed_by (full_name)
          )
        `)
        .eq('id', requestId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // Approuver une demande
  const approveRequest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          decision_comments: comments
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'approve',
          description: 'Demande approuvée',
          details: { comments },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-request', requestId] });
      toast({
        title: "Demande approuvée",
        description: "La demande a été approuvée avec succès"
      });
      setComments("");
    }
  });
  
  // Rejeter une demande
  const rejectRequest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          decision_comments: comments
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'reject',
          description: 'Demande rejetée',
          details: { comments },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-request', requestId] });
      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée"
      });
      setComments("");
    }
  });

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };
  
  // Formater la date relative
  const formatRelativeDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  // Rendu du badge pour le statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Rendu du badge pour la priorité
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Haute</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          La demande n'a pas pu être trouvée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <div className="ml-2 flex-1">
          <h2 className="text-2xl font-bold">Détails de la demande</h2>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Référence: {request.id.substring(0, 8)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatRelativeDate(request.created_at)}
          </Badge>
          {request.region && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {request.region}
            </Badge>
          )}
          {renderPriorityBadge(request.priority)}
          {renderStatusBadge(request.status)}
        </div>
        <div>
          <Badge className="flex items-center gap-1 bg-[#0D6A51] hover:bg-[#0D6A51]">
            <BadgeDollarSign className="h-3 w-3" />
            {formatAmount(request.amount)}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé de la demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Objet de la demande</h3>
                <p className="text-muted-foreground">{request.purpose}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">SFD</h3>
                <p className="text-muted-foreground">
                  {request.sfds?.name || "-"} ({request.sfds?.code || "-"})
                </p>
              </div>
              
              {request.justification && (
                <div>
                  <h3 className="font-medium mb-1">Justification</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {request.justification}
                  </p>
                </div>
              )}
              
              {request.expected_impact && (
                <div>
                  <h3 className="font-medium mb-1">Impact attendu</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {request.expected_impact}
                  </p>
                </div>
              )}
              
              {request.decision_comments && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-1">Commentaires de décision</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {request.decision_comments}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {request.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Traiter la demande</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ajoutez vos commentaires sur cette demande..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => rejectRequest.mutate()}
                  disabled={rejectRequest.isPending}
                >
                  {rejectRequest.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  Rejeter
                </Button>
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => approveRequest.mutate()}
                  disabled={approveRequest.isPending}
                >
                  {approveRequest.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Approuver
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents justificatifs</CardTitle>
            </CardHeader>
            <CardContent>
              {request.supporting_documents && request.supporting_documents.length > 0 ? (
                <div className="space-y-2">
                  {request.supporting_documents.map((docUrl: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Document {index + 1}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank')}
                        >
                          Consulter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">Aucun document</h3>
                  <p className="text-muted-foreground">
                    Aucun document n'a été joint à cette demande
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des activités</CardTitle>
            </CardHeader>
            <CardContent>
              {request.subsidy_request_activities && request.subsidy_request_activities.length > 0 ? (
                <div className="space-y-4">
                  {request.subsidy_request_activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-start border-b pb-4 last:border-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        {activity.activity_type === 'create' && (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                        {activity.activity_type === 'approve' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {activity.activity_type === 'reject' && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {activity.activity_type === 'update' && (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{activity.description}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(activity.performed_at)}
                          </span>
                        </div>
                        {activity.profiles && (
                          <p className="text-sm text-muted-foreground">
                            Par: {activity.profiles.full_name || "Utilisateur inconnu"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">Aucune activité</h3>
                  <p className="text-muted-foreground">
                    Aucune activité n'a été enregistrée pour cette demande
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
