import React, { useState } from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Calendar, FileText, AlertTriangle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
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
import ClientAccountDetails from '../client-accounts/ClientAccountDetails';
import { useClientAccountOperations } from '@/hooks/useClientAccountOperations';

interface ClientDetailsViewProps {
  client: SfdClient;
  onClose: () => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { validateClient, rejectClient, deleteClient } = useSfdClientManagement();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleValidateClient = async () => {
    if (!client || !client.id) return;
    await validateClient.mutateAsync(client.id);
    onClose();
  };
  
  const handleRejectClient = async () => {
    if (!client || !client.id) return;
    await rejectClient.mutateAsync({ clientId: client.id });
    onClose();
  };
  
  const handleDeleteClient = async () => {
    if (!client || !client.id) return;
    await deleteClient.mutateAsync(client.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-500" />
            {client.full_name}
          </h2>
          <div className="flex items-center space-x-2">
            {getStatusBadge(client.status)}
            
            <span className="text-sm text-gray-500">
              Client depuis {client.created_at ? format(new Date(client.created_at), 'PP', { locale: fr }) : '-'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {client.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleRejectClient}
                disabled={rejectClient.isPending}
              >
                Rejeter
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="border-green-200 text-green-600 hover:bg-green-50"
                onClick={handleValidateClient}
                disabled={validateClient.isPending}
              >
                Valider
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="loans">Prêts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="pt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Nom complet</p>
                  <p className="font-medium">{client.full_name}</p>
                </div>
                
                {client.phone && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Téléphone</p>
                    <p className="font-medium flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {client.phone}
                    </p>
                  </div>
                )}
                
                {client.email && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="font-medium flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {client.email}
                    </p>
                  </div>
                )}
                
                {client.address && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Adresse</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {client.address}
                    </p>
                  </div>
                )}
                
                {(client.id_type || client.id_number) && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Pièce d'identité</p>
                    <p className="font-medium flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {client.id_type || 'Non spécifié'}: {client.id_number || 'Non spécifié'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Date d'inscription</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {client.created_at ? format(new Date(client.created_at), 'PPP', { locale: fr }) : '-'}
                  </p>
                </div>
              </div>
              
              {client.validated_at && (
                <div className="border-t pt-3 mt-2">
                  <p className="text-xs font-medium text-gray-500">
                    {client.status === 'validated' ? 'Validé le' : 'Traité le'}
                  </p>
                  <p className="text-sm">
                    {format(new Date(client.validated_at), 'PPP', { locale: fr })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              Fermer
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer le client
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="pt-4">
          {client.status === 'validated' ? (
            <ClientAccountDetails 
              clientId={client.id}
              clientName={client.full_name}
            />
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200">
                    Client non validé
                  </Badge>
                  <p>Le client doit être validé avant de pouvoir gérer son compte.</p>
                  
                  {client.status === 'pending' && (
                    <Button 
                      className="mt-4"
                      onClick={handleValidateClient}
                      disabled={validateClient.isPending}
                    >
                      Valider le client
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="space-y-2">
                <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                <p>Aucun document fourni</p>
                <p className="text-sm text-gray-500">
                  Aucun document n'a été téléchargé pour ce client.
                </p>
                
                <Button className="mt-4" disabled>
                  Ajouter un document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="loans" className="pt-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="space-y-2">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto" />
                <p>Aucun prêt actif</p>
                <p className="text-sm text-gray-500">
                  Ce client n'a pas de prêts actifs pour le moment.
                </p>
                
                {client.status === 'validated' ? (
                  <Button className="mt-4">
                    Créer un prêt
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">
                    Le client doit être validé avant de pouvoir créer un prêt.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Supprimer le client
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à ce client seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteClient.isPending}
            >
              {deleteClient.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientDetailsView;
