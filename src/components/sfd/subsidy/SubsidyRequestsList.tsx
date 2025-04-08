
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, FileText, AlertTriangle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SubsidyRequestsListProps {
  onSelectRequest?: (requestId: string) => void;
}

export function SubsidyRequestsList({ onSelectRequest }: SubsidyRequestsListProps) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Récupérer les demandes de subvention
  const { data: subsidyRequests, isLoading } = useQuery({
    queryKey: ['subsidy-requests'],
    queryFn: async () => {
      // Récupérer les demandes pour l'utilisateur actuel
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filtrer les demandes selon le statut et la recherche
  const filteredRequests = subsidyRequests?.filter((request) => {
    const matchesStatus = 
      statusFilter === "all" || 
      request.status === statusFilter;
    
    const matchesSearch = 
      !searchQuery || 
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.sfds?.name && request.sfds.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Rendu du badge pour le statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Rendu du badge pour la priorité
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Haute</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par objet, région..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredRequests && filteredRequests.length > 0 ? (
        <Table>
          <TableCaption>Liste des demandes de subvention</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>SFD</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Région</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>{request.sfds?.name || "-"}</TableCell>
                <TableCell className="max-w-[180px] truncate" title={request.purpose}>
                  {request.purpose}
                </TableCell>
                <TableCell>{formatAmount(request.amount)}</TableCell>
                <TableCell>{request.region || "-"}</TableCell>
                <TableCell>{renderPriorityBadge(request.priority)}</TableCell>
                <TableCell>{renderStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectRequest && onSelectRequest(request.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          {searchQuery || statusFilter !== "all" ? (
            <>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos filtres de recherche
              </p>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Aucune demande</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore de demande de subvention
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
