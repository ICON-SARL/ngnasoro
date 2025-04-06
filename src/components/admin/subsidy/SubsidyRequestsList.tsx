
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Search, AlertTriangle } from 'lucide-react';

interface SubsidyRequestsListProps {
  requests: any[];
  isLoading: boolean;
  onSelectRequest: (requestId: string) => void;
  isAlertView?: boolean;
  defaultSortBy?: 'date' | 'amount' | 'priority';
}

export function SubsidyRequestsList({ 
  requests, 
  isLoading,
  onSelectRequest,
  isAlertView = false,
  defaultSortBy = 'date'
}: SubsidyRequestsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'priority'>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: 'date' | 'amount' | 'priority') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Filter and sort the requests
  const filteredRequests = requests.filter(request => 
    request.sfd_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'urgent': 3, 'high': 2, 'normal': 1, 'low': 0 };
      return sortOrder === 'asc' 
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-100">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100">Urgente</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trier par:</span>
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('date')}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant={sortBy === 'amount' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('amount')}
          >
            Montant {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant={sortBy === 'priority' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('priority')}
          >
            Priorité {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-b-2 border-[#0D6A51]"></div>
          <p className="mt-2 text-muted-foreground">Chargement des demandes...</p>
        </div>
      ) : sortedRequests.length === 0 ? (
        <div className="py-8 text-center border rounded-md bg-muted/10">
          <p className="text-muted-foreground">Aucune demande de subvention trouvée</p>
        </div>
      ) : (
        <Table className="border rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
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
            {sortedRequests.map((request) => (
              <TableRow key={request.id} className={request.alert_triggered && isAlertView ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">{formatDate(request.created_at)}</TableCell>
                <TableCell>{request.sfd_name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{request.purpose}</TableCell>
                <TableCell>{request.amount.toLocaleString()} FCFA</TableCell>
                <TableCell>{request.region || '—'}</TableCell>
                <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.alert_triggered && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSelectRequest(request.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
