
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileCheck,
  FileX,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCreditApplications } from '@/hooks/useCreditApplications';
import { Skeleton } from '@/components/ui/skeleton';

export const CreditApprovalComponent = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('risque_eleve');
  
  const { 
    applications = [], 
    isLoading, 
    approveApplication,
    rejectApplication
  } = useCreditApplications();
  
  const filteredApplications = applications?.filter(app => {
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'approved') return app.status === 'approved';
    if (activeTab === 'rejected') return app.status === 'rejected';
    return true; // 'all' tab
  });
  
  const handleApprove = (application: any) => {
    setSelectedApplication(application);
    setComments('');
    setShowApproveDialog(true);
  };
  
  const handleReject = (application: any) => {
    setSelectedApplication(application);
    setComments('');
    setRejectionReason('risque_eleve');
    setShowRejectDialog(true);
  };
  
  const confirmApprove = async () => {
    if (selectedApplication) {
      await approveApplication.mutate({ 
        applicationId: selectedApplication.id,
        comments: comments 
      });
      setShowApproveDialog(false);
    }
  };
  
  const confirmReject = async () => {
    if (selectedApplication) {
      await rejectApplication.mutate({
        applicationId: selectedApplication.id,
        rejectionReason: rejectionReason,
        comments: comments
      });
      setShowRejectDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Approbation de Crédit</CardTitle>
            <CardDescription>Évaluation et approbation des demandes de crédit SFD</CardDescription>
          </div>
          <Button>
            <FileCheck className="mr-2 h-4 w-4" /> Exporter les rapports
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">
              Toutes ({applications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              En attente ({applications?.filter(a => a.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approuvées ({applications?.filter(a => a.status === 'approved').length || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Rejetées ({applications?.filter(a => a.status === 'rejected').length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/10">
                        <th className="h-12 px-4 text-left align-middle font-medium">Référence</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">SFD</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Montant</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Score</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Statut</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">
                            Aucune demande de crédit trouvée
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="border-b transition-colors hover:bg-muted/10">
                            <td className="p-4 align-middle font-medium">{app.reference}</td>
                            <td className="p-4 align-middle">{app.sfd_name}</td>
                            <td className="p-4 align-middle">{app.amount.toLocaleString()} FCFA</td>
                            <td className="p-4 align-middle">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                                app.score >= 80 ? 'bg-green-100 text-green-800' :
                                app.score >= 60 ? 'bg-blue-100 text-blue-800' :
                                app.score >= 40 ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {app.score}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              {app.status === 'pending' && (
                                <Badge className="bg-amber-100 text-amber-800">
                                  <Clock className="mr-1 h-3 w-3" />
                                  En attente
                                </Badge>
                              )}
                              {app.status === 'approved' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Approuvée
                                </Badge>
                              )}
                              {app.status === 'rejected' && (
                                <Badge className="bg-red-100 text-red-800">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Rejetée
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center">
                                <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                                {new Date(app.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {app.status === 'pending' && (
                                <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(app)}
                                  >
                                    <FileX className="mr-1 h-4 w-4" />
                                    Rejeter
                                  </Button>
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(app)}
                                  >
                                    <FileCheck className="mr-1 h-4 w-4" />
                                    Approuver
                                  </Button>
                                </div>
                              )}
                              {(app.status === 'approved' || app.status === 'rejected') && (
                                <Button variant="ghost" size="sm">
                                  Détails
                                  <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approuver la demande de crédit</DialogTitle>
              <DialogDescription>
                Vous êtes sur le point d'approuver la demande de crédit {selectedApplication?.reference} 
                pour un montant de {selectedApplication?.amount?.toLocaleString()} FCFA.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Commentaires d'approbation (optionnel):</p>
                <Textarea
                  placeholder="Ajouter des commentaires à l'approbation..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={confirmApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Confirmer l'approbation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter la demande de crédit</DialogTitle>
              <DialogDescription>
                Vous êtes sur le point de rejeter la demande de crédit {selectedApplication?.reference}.
                Veuillez spécifier la raison du rejet.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Raison du rejet:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={rejectionReason === 'risque_eleve' ? 'default' : 'outline'}
                    className={rejectionReason === 'risque_eleve' ? 'border-2 border-primary' : ''}
                    onClick={() => setRejectionReason('risque_eleve')}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Risque élevé
                  </Button>
                  <Button
                    type="button"
                    variant={rejectionReason === 'docs_insuffisants' ? 'default' : 'outline'}
                    className={rejectionReason === 'docs_insuffisants' ? 'border-2 border-primary' : ''}
                    onClick={() => setRejectionReason('docs_insuffisants')}
                  >
                    Documents insuffisants
                  </Button>
                  <Button
                    type="button"
                    variant={rejectionReason === 'capacite_remboursement' ? 'default' : 'outline'}
                    className={rejectionReason === 'capacite_remboursement' ? 'border-2 border-primary' : ''}
                    onClick={() => setRejectionReason('capacite_remboursement')}
                  >
                    Capacité de remboursement
                  </Button>
                  <Button
                    type="button"
                    variant={rejectionReason === 'autre' ? 'default' : 'outline'}
                    className={rejectionReason === 'autre' ? 'border-2 border-primary' : ''}
                    onClick={() => setRejectionReason('autre')}
                  >
                    Autre raison
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Commentaires supplémentaires:</p>
                <Textarea
                  placeholder="Ajouter des commentaires détaillés sur la raison du rejet..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={confirmReject}
                variant="destructive"
              >
                <FileX className="mr-2 h-4 w-4" />
                Confirmer le rejet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
