
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  History,
  Send,
  Download,
  AlertCircle,
  Users,
  Gauge,
  CreditCard,
  BanknoteIcon
} from 'lucide-react';
import { DocumentType } from '@/types/merefLoanRequest';

interface MerefLoanRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

export function MerefLoanRequestDetail({
  requestId,
  onBack
}: MerefLoanRequestDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"submit" | "verify" | "approve" | "reject" | "meref">("submit");

  // Récupérer les détails de la demande
  const { data: request, isLoading } = useQuery({
    queryKey: ['meref-loan-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          *,
          sfd_clients (id, full_name, email, phone, id_number, id_type),
          meref_request_documents (id, document_type, document_url, filename, verified),
          meref_request_activities (
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
  
  // Soumettre la demande pour vérification interne
  const submitRequest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'submit',
          description: 'Demande soumise pour vérification interne',
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', requestId] });
      toast({
        title: "Demande soumise",
        description: "La demande a été soumise pour vérification interne"
      });
      setDialogOpen(false);
    }
  });
  
  // Approuver la demande en interne
  const approveRequest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'approved_internal',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'approve_internal',
          description: 'Demande approuvée en interne',
          details: comments ? { comments } : undefined,
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', requestId] });
      toast({
        title: "Demande approuvée",
        description: "La demande a été approuvée en interne"
      });
      setComments("");
      setDialogOpen(false);
    }
  });
  
  // Rejeter la demande en interne
  const rejectRequest = useMutation({
    mutationFn: async () => {
      if (!comments) throw new Error("Le motif de rejet est requis");
      
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'rejected_internal',
          rejection_reason: comments
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'reject_internal',
          description: 'Demande rejetée en interne',
          details: { reason: comments },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', requestId] });
      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée"
      });
      setComments("");
      setDialogOpen(false);
    }
  });
  
  // Vérifier un document
  const verifyDocument = useMutation({
    mutationFn: async ({ documentId, verified }: { documentId: string, verified: boolean }) => {
      const { data, error } = await supabase
        .from('meref_request_documents')
        .update({
          verified,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: verified ? 'verify_document' : 'reject_document',
          description: verified 
            ? `Document vérifié: ${data.filename}` 
            : `Document rejeté: ${data.filename}`,
          details: { document_id: documentId },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', requestId] });
      toast({
        title: "Document mis à jour",
        description: "Le statut du document a été mis à jour"
      });
    }
  });
  
  // Soumettre au MEREF
  const submitToMeref = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch('/api/submit-meref-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestId
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Échec de la soumission au MEREF');
        }
        
        return await response.json();
      } catch (error: any) {
        console.error('Error submitting to MEREF:', error);
        throw new Error(error.message || 'Échec de la soumission au MEREF');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', requestId] });
      toast({
        title: "Demande envoyée au MEREF",
        description: `Référence MEREF: ${data.data.meref_reference}`
      });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission au MEREF"
      });
    }
  });

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };
  
  // Formater la date relative
  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };
  
  // Obtenir le nom du type de document
  const getDocumentTypeName = (type?: DocumentType) => {
    if (!type) return "Document";
    
    switch (type) {
      case 'identity_card': return "Pièce d'identité";
      case 'payslip': return "Bulletin de salaire";
      case 'bank_statement': return "Relevé bancaire";
      case 'guarantees': return "Garanties";
      case 'business_plan': return "Plan d'affaires";
      case 'proof_of_address': return "Justificatif de domicile";
      case 'tax_certificate': return "Certificat fiscal";
      case 'other': return "Autre document";
      default: return "Document";
    }
  };
  
  // Rendu des actions disponibles selon le statut
  const renderActions = () => {
    if (!request) return null;
    
    switch (request.status) {
      case 'draft':
        return (
          <Button 
            onClick={() => {
              setDialogAction('submit');
              setDialogOpen(true);
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Soumettre pour vérification
          </Button>
        );
      case 'submitted':
      case 'document_verification':
      case 'credit_analysis':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => {
                setDialogAction('reject');
                setDialogOpen(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button 
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => {
                setDialogAction('approve');
                setDialogOpen(true);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </div>
        );
      case 'approved_internal':
        return (
          <Button 
            onClick={() => {
              setDialogAction('meref');
              setDialogOpen(true);
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Transmettre au MEREF
          </Button>
        );
      default:
        return null;
    }
  };
  
  // Obtenir le titre et la description pour la boîte de dialogue
  const getDialogContent = () => {
    switch (dialogAction) {
      case 'submit':
        return {
          title: "Soumettre la demande",
          description: "La demande va être soumise pour vérification interne. Elle ne pourra plus être modifiée en tant que brouillon.",
          action: () => submitRequest.mutate()
        };
      case 'approve':
        return {
          title: "Approuver la demande",
          description: "Cette demande sera approuvée en interne et sera prête à être transmise au MEREF.",
          action: () => approveRequest.mutate()
        };
      case 'reject':
        return {
          title: "Rejeter la demande",
          description: "Veuillez indiquer le motif du rejet de cette demande.",
          action: () => rejectRequest.mutate()
        };
      case 'meref':
        return {
          title: "Transmettre au MEREF",
          description: "Cette demande va être transmise au MEREF pour approbation finale. Assurez-vous que tous les documents ont été vérifiés.",
          action: () => submitToMeref.mutate()
        };
      default:
        return {
          title: "",
          description: "",
          action: () => {}
        };
    }
  };
  
  // Calculer la progression du traitement de la demande
  const getProgressValue = () => {
    if (!request) return 0;
    
    switch (request.status) {
      case 'draft': return 10;
      case 'submitted': return 20;
      case 'document_verification': return 30;
      case 'credit_analysis': return 50;
      case 'approved_internal': return 70;
      case 'meref_submitted': return 80;
      case 'meref_approved': return 100;
      case 'meref_rejected': return 100;
      default: return 0;
    }
  };
  
  // Rendu du badge pour le statut
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 border-gray-300">Brouillon</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Soumise</Badge>;
      case 'document_verification':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Vérification documents</Badge>;
      case 'credit_analysis':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Analyse crédit</Badge>;
      case 'approved_internal':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvée interne</Badge>;
      case 'rejected_internal':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée interne</Badge>;
      case 'meref_submitted':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Soumise au MEREF</Badge>;
      case 'meref_approved':
        return <Badge variant="outline" className="bg-green-500 text-white">Approuvée MEREF</Badge>;
      case 'meref_rejected':
        return <Badge variant="outline" className="bg-red-500 text-white">Rejetée MEREF</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Dialogue pour les actions
  const dialogContent = getDialogContent();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 text-red-800">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mt-0.5 mr-2 text-red-600" />
          <div>
            <h3 className="font-medium">Demande non trouvée</h3>
            <p className="mt-1 text-sm">
              Impossible de récupérer les détails de cette demande. Elle a peut-être été supprimée ou vous n'avez pas les droits nécessaires pour y accéder.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Demande de prêt MEREF</h2>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {renderStatusBadge(request.status)}
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Créée {formatRelativeDate(request.created_at)}
            </Badge>
            {request.meref_reference && (
              <Badge className="bg-blue-500">
                Réf. MEREF: {request.meref_reference}
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg">
              {formatAmount(request.amount)} sur {request.duration_months} mois
            </p>
            <p className="text-muted-foreground">
              {request.purpose}
            </p>
          </div>
          
          <div className="mt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Progression du traitement
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">
              <CreditCard className="h-4 w-4 mr-2" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="client">
              <Users className="h-4 w-4 mr-2" />
              Client
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
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <BanknoteIcon className="h-5 w-5 mr-2 text-green-600" />
                    Détails de la demande
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Montant du prêt</h4>
                    <p>{formatAmount(request.amount)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Durée</h4>
                    <p>{request.duration_months} mois</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Objet du prêt</h4>
                    <p>{request.purpose}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Revenu mensuel</h4>
                    <p>{request.monthly_income ? formatAmount(request.monthly_income) : "Non spécifié"}</p>
                  </div>
                </div>
                
                {request.guarantees && (
                  <div>
                    <h4 className="font-medium mb-1">Garanties</h4>
                    <p className="whitespace-pre-line">{request.guarantees}</p>
                  </div>
                )}
                
                {request.risk_score !== null && (
                  <div className="mt-4 p-4 border rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <Gauge className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="font-medium">Score de risque</h4>
                    </div>
                    <div className="mt-2 flex items-center">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              request.risk_score >= 70 ? 'bg-green-500' : 
                              request.risk_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${request.risk_score}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>Risque élevé</span>
                          <span>Risque faible</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`text-xl font-bold ${
                          request.risk_score >= 70 ? 'text-green-600' : 
                          request.risk_score >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {request.risk_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {request.rejection_reason && (
                  <div className="mt-4 p-4 border rounded-md bg-red-50 text-red-800">
                    <h4 className="font-medium mb-1 flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Motif du rejet
                    </h4>
                    <p>{request.rejection_reason}</p>
                  </div>
                )}
                
                {request.meref_feedback && (
                  <div className="mt-4 p-4 border rounded-md bg-blue-50 text-blue-800">
                    <h4 className="font-medium mb-1 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      Retour du MEREF
                    </h4>
                    <p>{request.meref_feedback}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                {renderActions()}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="client" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Informations du client
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Nom complet</h4>
                    <p>{request.sfd_clients?.full_name || "Non spécifié"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <p>{request.sfd_clients?.email || "Non spécifié"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Téléphone</h4>
                    <p>{request.sfd_clients?.phone || "Non spécifié"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Pièce d'identité</h4>
                    <p>
                      {request.sfd_clients?.id_type || "Type non spécifié"}: {request.sfd_clients?.id_number || "N° non spécifié"}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Voir la fiche client complète
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-600" />
                    Documents justificatifs
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {request.meref_request_documents && request.meref_request_documents.length > 0 ? (
                  <div className="space-y-3">
                    {request.meref_request_documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            doc.verified ? 'bg-green-100 text-green-600' : 
                            doc.verified === false ? 'bg-red-100 text-red-600' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{getDocumentTypeName(doc.document_type as DocumentType)}</p>
                            <p className="text-sm text-muted-foreground">{doc.filename}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {doc.verified === undefined && request.status !== 'draft' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => verifyDocument.mutate({ documentId: doc.id, verified: false })}
                              >
                                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                Rejeter
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => verifyDocument.mutate({ documentId: doc.id, verified: true })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                Vérifier
                              </Button>
                            </>
                          )}
                          {doc.verified !== undefined && (
                            <Badge className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {doc.verified ? 'Vérifié' : 'Rejeté'}
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(doc.document_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun document</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Aucun document n'a été téléchargé pour cette demande.
                      Les documents justificatifs sont requis pour l'évaluation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-600" />
                    Historique des activités
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {request.meref_request_activities && request.meref_request_activities.length > 0 ? (
                  <div className="space-y-6">
                    {request.meref_request_activities
                      .sort((a: any, b: any) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())
                      .map((activity: any) => (
                        <div key={activity.id} className="flex items-start border-b pb-4 last:border-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            activity.activity_type.includes('approve') ? 'bg-green-100 text-green-600' : 
                            activity.activity_type.includes('reject') ? 'bg-red-100 text-red-600' : 
                            activity.activity_type.includes('verify') ? 'bg-blue-100 text-blue-600' : 
                            activity.activity_type.includes('submit') ? 'bg-amber-100 text-amber-600' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.activity_type.includes('submit') && <Send className="h-5 w-5" />}
                            {activity.activity_type.includes('approve') && <CheckCircle className="h-5 w-5" />}
                            {activity.activity_type.includes('reject') && <XCircle className="h-5 w-5" />}
                            {activity.activity_type.includes('verify') && <FileText className="h-5 w-5" />}
                            {activity.activity_type.includes('create') && <FileText className="h-5 w-5" />}
                            {!activity.activity_type.includes('submit') && 
                             !activity.activity_type.includes('approve') && 
                             !activity.activity_type.includes('reject') && 
                             !activity.activity_type.includes('verify') && 
                             !activity.activity_type.includes('create') && 
                              <Clock className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{activity.description}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeDate(activity.performed_at)}
                              </span>
                            </div>
                            {activity.profiles && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Par: {activity.profiles.full_name || "Utilisateur inconnu"}
                              </p>
                            )}
                            {activity.details && activity.details.reason && (
                              <p className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                Raison: {activity.details.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune activité</h3>
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
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          
          {dialogAction === 'reject' && (
            <Textarea 
              placeholder="Veuillez préciser le motif du rejet..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          )}
          
          {dialogAction === 'approve' && (
            <Textarea 
              placeholder="Commentaires (optionnel)..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          )}
          
          {dialogAction === 'meref' && request.meref_request_documents && (
            <div className="bg-amber-50 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-amber-800">Vérification des documents</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {request.meref_request_documents.filter((doc: any) => doc.verified === true).length} 
                    /{request.meref_request_documents.length} documents vérifiés
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitRequest.isPending || approveRequest.isPending || rejectRequest.isPending || submitToMeref.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={dialogContent.action}
              disabled={
                (dialogAction === 'reject' && !comments) || 
                submitRequest.isPending || 
                approveRequest.isPending || 
                rejectRequest.isPending || 
                submitToMeref.isPending
              }
              variant={dialogAction === 'reject' ? 'destructive' : 'default'}
            >
              {(submitRequest.isPending || approveRequest.isPending || rejectRequest.isPending || submitToMeref.isPending) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
