
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, FileText, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SubsidyRequestsListProps {
  subsidyRequests: any[];
  isLoading: boolean;
  onSelectRequest: (id: string) => void;
}

export const SubsidyRequestsList = ({ 
  subsidyRequests, 
  isLoading, 
  onSelectRequest 
}: SubsidyRequestsListProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredRequests = subsidyRequests.filter(req => 
    req.sfd_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
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
    switch (priority) {
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
        
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SFD</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Région</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.sfd_name}</TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell className="font-medium">{request.amount?.toLocaleString()} FCFA</TableCell>
                <TableCell>{request.purpose}</TableCell>
                <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                <TableCell>{request.region || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
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
      ) : (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">Aucune demande trouvée</h3>
          <p className="text-muted-foreground mt-1">
            Il n'y a pas encore de demandes de subvention.
          </p>
        </div>
      )}
    </div>
  );
};
