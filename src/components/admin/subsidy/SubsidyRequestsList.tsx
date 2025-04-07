
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubsidyRequest } from '@/types/subsidyRequests';
import { FileText, CheckCircle, XCircle, Clock, Search, Filter, CalendarIcon } from 'lucide-react';

interface SubsidyRequestsListProps {
  requests: SubsidyRequest[];
  isLoading: boolean;
  onSelectRequest: (requestId: string) => void;
}

export function SubsidyRequestsList({ requests, isLoading, onSelectRequest }: SubsidyRequestsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredRequests = requests.filter(req => {
    // Apply search filter
    const matchesSearch = req.sfd_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.region?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    // Apply priority filter
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const renderStatusBadge = (status: SubsidyRequest['status']) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejetée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const renderPriorityBadge = (priority: SubsidyRequest['priority']) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="border-gray-300 text-gray-700">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="border-red-300 text-red-700">Urgente</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };
  
  const getPurposeName = (purpose: string) => {
    switch(purpose) {
      case 'agriculture': return 'Agriculture';
      case 'women_empowerment': return 'Autonomisation des femmes';
      case 'youth_employment': return 'Emploi des jeunes';
      case 'small_business': return 'Petites entreprises';
      case 'microfinance': return 'Expansion des activités de microfinance';
      case 'other': return 'Autre';
      default: return purpose;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-8 w-8 rounded-full border-2 border-t-[#0D6A51] animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center min-w-[140px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="under_review">En cours d'examen</SelectItem>
                  <SelectItem value="approved">Approuvée</SelectItem>
                  <SelectItem value="rejected">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center min-w-[140px]">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-1">Aucune demande trouvée</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Aucune demande ne correspond à vos critères de recherche.' 
                : 'Aucune demande de prêt n\'a encore été soumise.'}
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SFD</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className={request.alert_triggered ? 'bg-amber-50' : ''}>
                    <TableCell className="font-medium">
                      {request.sfd_name || 'SFD Inconnue'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-3 w-3 mr-2 text-gray-500" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{request.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{getPurposeName(request.purpose)}</TableCell>
                    <TableCell>{renderPriorityBadge(request.priority)}</TableCell>
                    <TableCell>{renderStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onSelectRequest(request.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}
