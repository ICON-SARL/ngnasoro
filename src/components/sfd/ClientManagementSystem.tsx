import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Download, Eye, CheckCircle, XCircle, 
  Calendar, Filter, Phone, Mail, User 
} from 'lucide-react';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import { useClientExport } from '@/hooks/useClientExport';
import { ClientAlerts } from './client/ClientAlerts';
import { ClientSavings } from './client/ClientSavings';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function ClientManagementSystem() {
  const {
    clients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedClients,
    toggleClientSelection,
    selectAllClients,
    hasSelectedClients,
    batchValidateClients,
    batchRejectClients
  } = useSfdClientManagement();

  const { exportToCSV, isExporting } = useClientExport();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const selectedClient = selectedClientId 
    ? clients.find(client => client.id === selectedClientId)
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6A51]"></div>
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
            <Button
              variant="outline"
              onClick={() => exportToCSV(clients)}
              disabled={isExporting || clients.length === 0}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and filters */}
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
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
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

        {/* Batch operations */}
        {hasSelectedClients && (
          <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
            <span>{selectedClients.length} client(s) sélectionné(s)</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => batchValidateClients.mutate({ notes: '' })}
                disabled={batchValidateClients.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Valider
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => batchRejectClients.mutate({ rejectionReason: 'Rejet groupé' })}
                disabled={batchRejectClients.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
            </div>
          </div>
        )}

        {/* Clients table */}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
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
                    <div className="text-sm text-muted-foreground">
                      {client.id_type && client.id_number ? (
                        `${client.id_type}: ${client.id_number}`
                      ) : (
                        'Pas d\'ID'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        client.status === 'validated' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : client.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
                    >
                      {client.status === 'validated' ? 'Validé' :
                       client.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(client.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="sr-only">Menu</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Client details dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails du client</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Client alerts */}
              <ClientAlerts client={selectedClient} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Information personnelle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nom complet</label>
                      <div className="font-medium">{selectedClient.full_name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Contact</label>
                      <div className="space-y-1">
                        {selectedClient.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {selectedClient.phone}
                          </div>
                        )}
                        {selectedClient.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {selectedClient.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Pièce d'identité</label>
                      <div className="font-medium">
                        {selectedClient.id_type}: {selectedClient.id_number}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Niveau KYC</label>
                      <div className="font-medium">{selectedClient.kyc_level}/3</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Client savings */}
                <ClientSavings 
                  clientId={selectedClient.id} 
                  sfdId={selectedClient.sfd_id} 
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
