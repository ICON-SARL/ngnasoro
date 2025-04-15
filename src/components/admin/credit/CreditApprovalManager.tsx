
import React, { useState } from 'react';
import { useCreditRequests, CreditRequest } from '@/hooks/useCreditRequests';
import { CreditApprovalList } from './CreditApprovalList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreditApprovalManager() {
  const { data: requests = [], isLoading } = useCreditRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter requests based on search term and status
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.sfd_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'all' || 
      req.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  const handleSelectRequest = (request: CreditRequest) => {
    console.log('Selected request:', request);
    // Implement request details view
  };

  const handleApproveRequest = (request: CreditRequest) => {
    console.log('Approve request:', request);
    // Implement approve logic
  };

  const handleRejectRequest = (request: CreditRequest) => {
    console.log('Reject request:', request);
    // Implement reject logic
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par référence, SFD, objectif..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-60">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Crédit</CardTitle>
          <CardDescription>
            Examinez et approuvez les demandes de crédit des SFDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des demandes...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-8 bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                Aucune demande de crédit trouvée
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <CreditApprovalList
                requests={filteredRequests}
                onSelectRequest={handleSelectRequest}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
