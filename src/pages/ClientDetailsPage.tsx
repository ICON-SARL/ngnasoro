
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  CornerDownLeft, 
  Phone, 
  Mail, 
  MapPin, 
  ClipboardCheck, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Calendar, 
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { sfdClientApi } from '@/utils/sfdClientApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const ClientDetailsPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => sfdClientApi.getClientById(clientId || ''),
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/sfd-clients')}
              >
                <CornerDownLeft className="h-4 w-4" />
              </Button>
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
              <h2 className="text-xl font-semibold mb-2">Client non trouvé</h2>
              <p className="text-muted-foreground mb-4">
                Le client demandé n'existe pas ou a été supprimé.
              </p>
              <Button onClick={() => navigate('/sfd-clients')}>
                <CornerDownLeft className="mr-2 h-4 w-4" /> Retour aux clients
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleValidateClient = async () => {
    try {
      await sfdClientApi.validateClientAccount(client.id, 'current-user-id', 'Validation manuelle');
      setShowValidateDialog(false);
      toast({
        title: "Client validé",
        description: "Le compte client a été validé avec succès",
      });
      navigate(0); // Refresh the page
    } catch (error) {
      console.error('Erreur lors de la validation du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de valider le client",
        variant: "destructive",
      });
    }
  };

  const handleRejectClient = async () => {
    try {
      await sfdClientApi.rejectClientAccount(client.id, 'current-user-id', 'Rejet manuel');
      setShowRejectDialog(false);
      toast({
        title: "Client rejeté",
        description: "Le compte client a été rejeté",
      });
      navigate(0); // Refresh the page
    } catch (error) {
      console.error('Erreur lors du rejet du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/sfd-clients')}
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Détails du Client</h1>
            {getStatusBadge(client.status)}
          </div>
          
          <div className="flex gap-2">
            {client.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowValidateDialog(true)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              </>
            )}
            {client.status === 'validated' && (
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Nouveau Prêt
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Nom complet</h3>
                    <p className="text-lg">{client.full_name}</p>
                  </div>
                  {client.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Téléphone</h3>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="text-lg">{client.phone}</p>
                      </div>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <p className="text-lg">{client.email}</p>
                      </div>
                    </div>
                  )}
                  {client.address && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Adresse</h3>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="text-lg">{client.address}</p>
                      </div>
                    </div>
                  )}
                  {client.id_type && client.id_number && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Pièce d'identité
                      </h3>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-gray-500" />
                        <p className="text-lg">
                          {client.id_type === 'cni' ? 'CNI' : client.id_type}: {client.id_number}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Date d'ajout
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-lg">
                        {new Date(client.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="loans">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="loans" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Prêts
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Activités
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="loans">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Aucun prêt actif</h3>
                      <p className="text-muted-foreground mb-4">
                        Ce client n'a pas de prêts actifs pour le moment.
                      </p>
                      <Button>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Nouveau Prêt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Aucun document</h3>
                      <p className="text-muted-foreground mb-4">
                        Aucun document n'a été ajouté pour ce client.
                      </p>
                      <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        Ajouter un document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activities">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Aucune activité</h3>
                      <p className="text-muted-foreground">
                        Aucune activité enregistrée pour ce client.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-xl">
                      {client.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{client.full_name}</h2>
                  <p className="text-muted-foreground">
                    ID: {client.id.substring(0, 8)}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(client.status)}
                  </div>
                </div>
                
                {client.notes && (
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Statistiques</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Prêts actifs</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <p className="text-2xl font-bold">0%</p>
                      <p className="text-xs text-muted-foreground">Taux de remboursement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Nouveau prêt
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Ajouter un document
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Modifier le profil
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le profil</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-muted-foreground">
                        Fonctionnalité à implémenter
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialog de validation */}
      <AlertDialog 
        open={showValidateDialog} 
        onOpenChange={setShowValidateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider ce client?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider le compte de <strong>{client.full_name}</strong>? 
              Cette action permettra au client d'accéder à tous les services de la SFD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleValidateClient}
              className="bg-green-600 hover:bg-green-700"
            >
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog de rejet */}
      <AlertDialog 
        open={showRejectDialog} 
        onOpenChange={setShowRejectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter ce client?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir rejeter le compte de <strong>{client.full_name}</strong>? 
              Cette action empêchera le client d'accéder aux services de la SFD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectClient}
              className="bg-red-600 hover:bg-red-700"
            >
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientDetailsPage;
