
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

interface MerefLoanRequestsListProps {
  onSelectRequest?: (requestId: string) => void;
}

export function MerefLoanRequestsList({ onSelectRequest }: MerefLoanRequestsListProps) {
  const { activeSfdId } = useSfdDataAccess();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Récupérer les demandes de prêt
  const { data: requests, isLoading } = useQuery({
    queryKey: ['meref-loan-requests', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          *,
          sfd_clients (full_name, id_number)
        `)
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeSfdId
  });
  
  // Filtrer les demandes selon le statut et la recherche
  const filteredRequests = requests?.filter((request) => {
    const matchesStatus = 
      statusFilter === "all" || 
      request.status === statusFilter;
    
    const matchesSearch = 
      !searchQuery || 
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.sfd_clients?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };
  
  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: fr });
  };
  
  // Formater la date relative
  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };
  
  // Rendu du badge pour le statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 border-gray-300">Brouillon</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Soumise</Badge>;
      case 'document_verification':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Vérification documents</Badge>;
      case 'credit_analysis':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Analyse crédit</Badge>;
      case 'approved_internal':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvée interne</Badge>;
      case 'rejected_internal':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée interne</Badge>;
      case 'meref_submitted':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Soumise au MEREF</Badge>;
      case 'meref_approved':
        return <Badge variant="outline" className="bg-green-500 text-white">Approuvée MEREF</Badge>;
      case 'meref_rejected':
        return <Badge variant="outline" className="bg-red-500 text-white">Rejetée MEREF</Badge>;
      case 'meref_pending_info':
        return <Badge variant="outline" className="bg-orange-500 text-white">MEREF - Infos requises</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client ou objet..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="submitted">Soumises</SelectItem>
              <SelectItem value="approved_internal">Approuvées interne</SelectItem>
              <SelectItem value="rejected_internal">Rejetées interne</SelectItem>
              <SelectItem value="meref_submitted">Soumises au MEREF</SelectItem>
              <SelectItem value="meref_approved">Approuvées MEREF</SelectItem>
              <SelectItem value="meref_rejected">Rejetées MEREF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredRequests && filteredRequests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-xs">
                  {request.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {request.sfd_clients?.full_name || "Client inconnu"}
                </TableCell>
                <TableCell className="max-w-[180px] truncate" title={request.purpose}>
                  {request.purpose}
                </TableCell>
                <TableCell>{formatAmount(request.amount)}</TableCell>
                <TableCell>{request.duration_months} mois</TableCell>
                <TableCell>{renderStatusBadge(request.status)}</TableCell>
                <TableCell title={formatDate(request.created_at)}>
                  {formatRelativeDate(request.created_at)}
                </TableCell>
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Aucune demande</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore créé de demande de prêt MEREF
              </p>
              <Button onClick={() => onSelectRequest && onSelectRequest("new")}>
                Créer une demande
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
