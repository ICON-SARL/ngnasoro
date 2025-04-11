
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Edit, File, Link, UserCircle } from 'lucide-react';

type ClientDetailsProps = {
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'pending' | 'inactive';
    createdAt: string;
  };
  onEdit?: () => void;
  onViewDocuments?: () => void;
  onViewSavings?: () => void;
  onLinkAccount?: () => void;
  isLoading?: boolean;
}

export const ClientDetails = ({
  client,
  onEdit,
  onViewDocuments,
  onViewSavings,
  onLinkAccount,
  isLoading = false
}: ClientDetailsProps) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-32 animate-pulse bg-gray-200 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div>
                <div className="h-5 w-full animate-pulse bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Client non trouvé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Les détails du client ne sont pas disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          <span>{client.name}</span>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit} className="ml-auto">
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm">{client.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Téléphone</p>
            <p className="text-sm">{client.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Adresse</p>
            <p className="text-sm">{client.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Statut</p>
            <div className="flex items-center">
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                client.status === 'active' ? 'bg-green-500' : 
                client.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm capitalize">{client.status}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date de création</p>
            <p className="text-sm">{new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {onViewDocuments && (
            <Button 
              variant="outline" 
              className="justify-between" 
              onClick={onViewDocuments}
            >
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2" />
                Documents
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          
          {onViewSavings && (
            <Button 
              variant="outline" 
              className="justify-between" 
              onClick={onViewSavings}
            >
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2" />
                Comptes d'épargne
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          
          {onLinkAccount && (
            <Button 
              variant="outline" 
              className="justify-between" 
              onClick={onLinkAccount}
            >
              <div className="flex items-center">
                <Link className="h-4 w-4 mr-2" />
                Lier un compte
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
