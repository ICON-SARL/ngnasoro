
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield
} from 'lucide-react';

interface ClientDetailsProps {
  client: SfdClient;
}

const ClientDetails = ({ client }: ClientDetailsProps) => {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-green-50 text-green-700">Validé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  const getKycLevel = (level: number) => {
    switch(level) {
      case 0:
        return "Non vérifié";
      case 1:
        return "Basique";
      case 2:
        return "Intermédiaire";
      case 3:
        return "Complet";
      default:
        return "Inconnu";
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Informations personnelles
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">Nom complet</div>
                <div>{client.full_name}</div>
              </div>
              
              {client.email && (
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{client.email}</span>
                  </div>
                </div>
              )}
              
              {client.phone && (
                <div>
                  <div className="text-sm font-medium">Téléphone</div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{client.phone}</span>
                  </div>
                </div>
              )}
              
              {client.address && (
                <div>
                  <div className="text-sm font-medium">Adresse</div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{client.address}</span>
                  </div>
                </div>
              )}
              
              {client.id_type && client.id_number && (
                <div>
                  <div className="text-sm font-medium">Pièce d'identité</div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {client.id_type}: {client.id_number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Statut du compte
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Statut actuel</div>
                <div>{getStatusBadge(client.status)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Niveau KYC</div>
                <div>{getKycLevel(client.kyc_level)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Date de création</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{new Date(client.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {client.validated_at && (
                <div>
                  <div className="text-sm font-medium">
                    {client.status === 'validated' ? 'Date de validation' : 'Date de rejet'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{new Date(client.validated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {client.notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Notes</h3>
            <p className="text-sm text-gray-700">{client.notes}</p>
          </CardContent>
        </Card>
      )}
      
      {client.status !== 'pending' && (
        <div className={`p-4 rounded-md flex items-start space-x-3 ${
          client.status === 'validated' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {getStatusIcon(client.status)}
          <div>
            <h3 className={`font-medium ${
              client.status === 'validated' ? 'text-green-800' : 'text-red-800'
            }`}>
              {client.status === 'validated' ? 'Compte validé' : 'Compte rejeté'}
            </h3>
            <p className={`text-sm mt-1 ${
              client.status === 'validated' ? 'text-green-700' : 'text-red-700'
            }`}>
              {client.status === 'validated' 
                ? "Ce client a été validé et a accès aux services financiers de votre SFD." 
                : "Ce client a été rejeté et n'a pas accès aux services financiers de votre SFD."
              }
              {client.validated_at && (
                <> Le {new Date(client.validated_at).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;
