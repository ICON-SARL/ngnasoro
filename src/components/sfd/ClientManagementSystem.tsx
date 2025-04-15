
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  User, Phone, Mail, CheckCircle, XCircle, 
  Eye, Loader2, Download, Upload, Calendar, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import { SelectField } from '@/components/sfd/client/SelectField';
import { BatchOperations } from '@/components/sfd/client/BatchOperations';
import { ClientImport } from '@/components/sfd/client/ClientImport';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClientManagementSystem() {
  const {
    clients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    batchValidateClients,
    batchRejectClients,
    importClients,
    selectedClients,
    toggleClientSelection,
    selectAllClients,
    hasSelectedClients
  } = useSfdClientManagement();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p>Une erreur s'est produite lors du chargement des clients.</p>
        <p className="text-sm mt-2">{String(error)}</p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Gestion des Clients</CardTitle>
          
          <div className="flex flex-wrap gap-2">
            <ClientImport 
              onImport={(clients) => importClients.mutate(clients)} 
              isImporting={importClients.isPending}
            />
            
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => {
                // Exemple d'export
                console.log('Export des clients');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Actions en masse quand des éléments sont sélectionnés */}
        {hasSelectedClients && (
          <BatchOperations
            selectedCount={selectedClients.length}
            onValidate={(options) => batchValidateClients.mutate(options)}
            onReject={(options) => batchRejectClients.mutate(options)}
            isValidating={batchValidateClients.isPending}
            isRejecting={batchRejectClients.isPending}
          />
        )}
        
        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="text-sm font-medium block mb-2">
              Rechercher un client
            </label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <User className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="status-filter" className="text-sm font-medium block mb-2">
              Statut
            </label>
            <Select
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tableau des clients */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={clients.length > 0 && selectedClients.length === clients.length}
                    onCheckedChange={selectAllClients}
                    aria-label="Sélectionner tous les clients"
                  />
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => toggleClientSelection(client.id)}
                        aria-label={`Sélectionner ${client.full_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {client.id_type && client.id_number ? (
                          <>
                            {client.id_type}: {client.id_number}
                          </>
                        ) : (
                          <span className="text-gray-400">Pas d'ID</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-500" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-500" />
                          {client.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.status === 'validated' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validé
                        </Badge>
                      )}
                      {client.status === 'rejected' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejeté
                        </Badge>
                      )}
                      {client.status === 'pending' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(client.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Menu</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                          {client.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => batchValidateClients.mutate({ notes: '' })}>
                                Valider
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => batchRejectClients.mutate({ rejectionReason: 'Rejet individuel' })}>
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination (version simple) */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Affichage de {clients.length} client(s)
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
            <Button variant="outline" size="sm" disabled>
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
