
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSfdClientDetails } from '@/hooks/useSfdClientDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientDetailActions from './ClientDetailActions';
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { client, isLoading, error, refetch } = useSfdClientDetails(clientId);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48 ml-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !client) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error || "Client introuvable"}</p>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations du client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <div className="flex items-center text-gray-700 mb-3">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">Nom complet:</span>
                </div>
                <span className="text-lg font-semibold ml-7">{client.full_name}</span>
              </div>
              
              {client.phone && (
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-700 mb-1">
                    <Phone className="h-5 w-5 mr-2" />
                    <span className="font-medium">Téléphone:</span>
                  </div>
                  <span className="ml-7">{client.phone}</span>
                </div>
              )}
              
              {client.email && (
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-700 mb-1">
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="font-medium">Email:</span>
                  </div>
                  <span className="ml-7">{client.email}</span>
                </div>
              )}
              
              {client.address && (
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-700 mb-1">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">Adresse:</span>
                  </div>
                  <span className="ml-7">{client.address}</span>
                </div>
              )}
              
              {client.id_number && (
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-700 mb-1">
                    <FileText className="h-5 w-5 mr-2" />
                    <span className="font-medium">N° d'identification:</span>
                  </div>
                  <span className="ml-7">{client.id_type || 'Pièce d'identité'}: {client.id_number}</span>
                </div>
              )}
              
              <div className="flex flex-col">
                <div className="flex items-center text-gray-700 mb-1">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">Date de création:</span>
                </div>
                <span className="ml-7">{formatDate(client.created_at)}</span>
              </div>
              
              {client.validated_at && (
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-700 mb-1">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Date de validation:</span>
                  </div>
                  <span className="ml-7">{formatDate(client.validated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <ClientDetailActions client={client} onClientUpdated={refetch} />
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
