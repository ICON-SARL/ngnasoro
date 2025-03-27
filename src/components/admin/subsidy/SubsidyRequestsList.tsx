
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  AlertTriangle, 
  Building, 
  Calendar,
  ArrowUpDown,
  Search
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SubsidyRequest } from '@/types/subsidyRequests';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';

interface SubsidyRequestsListProps {
  requests: SubsidyRequest[];
  isLoading: boolean;
  onSelectRequest: (id: string) => void;
  defaultSortBy?: 'date' | 'amount' | 'priority';
  isAlertView?: boolean;
}

export function SubsidyRequestsList({ 
  requests, 
  isLoading, 
  onSelectRequest,
  defaultSortBy = 'date',
  isAlertView = false
}: SubsidyRequestsListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'priority'>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const { updateSubsidyRequestPriority, updateSubsidyRequestStatus } = useSubsidyRequests();
  
  // Filter and sort the requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...requests];
    
    // Apply search filter
    if (filterValue) {
      const lowercaseFilter = filterValue.toLowerCase();
      filtered = filtered.filter(req => 
        req.sfd_name?.toLowerCase().includes(lowercaseFilter) ||
        req.purpose.toLowerCase().includes(lowercaseFilter) ||
        req.region?.toLowerCase().includes(lowercaseFilter) ||
        req.amount.toString().includes(lowercaseFilter)
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }
    
    // Sort the filtered requests
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortBy === 'priority') {
        const priorityValues = { 'urgent': 3, 'high': 2, 'normal': 1, 'low': 0 };
        return sortDirection === 'asc'
          ? priorityValues[a.priority] - priorityValues[b.priority]
          : priorityValues[b.priority] - priorityValues[a.priority];
      }
      return 0;
    });
  }, [requests, filterValue, sortBy, sortDirection, priorityFilter]);
  
  // Toggle sort direction
  const toggleSort = (column: 'date' | 'amount' | 'priority') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  const handlePriorityChange = (requestId: string, priority: 'low' | 'normal' | 'high' | 'urgent') => {
    updateSubsidyRequestPriority.mutate({ requestId, priority });
  };
  
  const handleMarkUnderReview = (requestId: string) => {
    updateSubsidyRequestStatus.mutate({ 
      requestId, 
      status: 'under_review',
      comments: 'Demande mise en cours d\'examen'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800">Haute</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">Normale</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Basse</Badge>;
      default:
        return <Badge>Inconnue</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0D6A51]"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des demandes...</p>
        </div>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-medium">Aucune demande trouvée</h3>
        <p className="text-sm text-gray-500 mt-1">
          {isAlertView 
            ? "Aucune demande n'a déclenché d'alerte de seuil"
            : "Il n'y a pas de demandes correspondant aux critères"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Rechercher..."
            className="pl-8"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        
        <Select
          value={priorityFilter}
          onValueChange={setPriorityFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les priorités</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="normal">Normale</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SFD</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => toggleSort('amount')}>
                  Montant
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => toggleSort('priority')}>
                  Priorité
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => toggleSort('date')}>
                  Date
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.map((request) => (
              <TableRow key={request.id} className={request.alert_triggered ? 'bg-red-50' : ''}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                      <Building className="h-4 w-4" />
                    </div>
                    {request.sfd_name}
                    {request.alert_triggered && (
                      <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{request.purpose}</TableCell>
                <TableCell className="font-medium">{request.amount.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  {request.status === 'pending' ? (
                    <Select
                      defaultValue={request.priority}
                      onValueChange={(value) => handlePriorityChange(
                        request.id, 
                        value as 'low' | 'normal' | 'high' | 'urgent'
                      )}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getPriorityBadge(request.priority)
                  )}
                </TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkUnderReview(request.id)}
                      >
                        Examiner
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSelectRequest(request.id)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
