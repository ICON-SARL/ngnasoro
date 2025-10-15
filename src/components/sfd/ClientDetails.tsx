
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Edit, Trash2, Mail, Phone, MapPin, User, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSfdClientDetails } from '@/hooks/useSfdClientDetails';
import ClientProfileEdit from './ClientProfileEdit';
import { SfdClient } from '@/types/sfdClients';

export interface ClientDetailsProps {
  clientId: string;
  onDeleted?: () => void;
  onClose?: () => void;
  onClientUpdated?: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  clientId, 
  onClose, 
  onDeleted,
  onClientUpdated 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { client, isLoading, error, refetch } = useSfdClientDetails(clientId);

  const getKycLevelText = (level: string | number): string => {
    if (typeof level === 'number') {
      if (level === 0) return 'Aucun (KYC0)';
      if (level === 1) return 'Basique (KYC1)';
      if (level >= 2) return 'Complet (KYC2)';
      return 'Inconnu';
    } else {
      if (level === 'none') return 'Aucun (KYC0)';
      if (level === 'basic') return 'Basique (KYC1)';
      if (level === 'full') return 'Complet (KYC2)';
      return 'Inconnu';
    }
  };

  const getKycLevelBadge = (level: string | number) => {
    let numericLevel = 0;
    
    if (typeof level === 'number') {
      numericLevel = level;
    } else {
      if (level === 'basic') numericLevel = 1;
      if (level === 'full') numericLevel = 2;
    }
    
    if (numericLevel === 0) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">KYC0</Badge>;
    } else if (numericLevel === 1) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">KYC1</Badge>;
    } else if (numericLevel >= 2) {
      return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">KYC2</Badge>;
    }
    
    return <Badge variant="outline">Inconnu</Badge>;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleClientSaved = () => {
    setIsEditing(false);
    refetch();
    if (onClientUpdated) onClientUpdated();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Chargement des informations du client...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <ClientProfileEdit
        clientId={clientId}
        onSaved={handleClientSaved}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du client</CardTitle>
        <CardDescription>
          Informations complètes sur le client
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{client?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{client?.full_name}</h2>
            <p className="text-sm text-muted-foreground">
              Client depuis le {new Date(client?.created_at || '').toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Informations personnelles</h3>
            <div className="text-sm space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{client?.full_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client?.email || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client?.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client?.address || 'Non renseignée'}</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
