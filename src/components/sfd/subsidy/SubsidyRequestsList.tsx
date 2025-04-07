
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const SubsidyRequestsList: React.FC = () => {
  const { activeSfdId } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!activeSfdId) return;
      
      try {
        const { data, error } = await supabase
          .from('subsidy_requests')
          .select('*')
          .eq('sfd_id', activeSfdId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Erreur lors de la récupération des demandes:', error);
          return;
        }
        
        setRequests(data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [activeSfdId]);
  
  const filteredRequests = requests.filter(req => 
    req.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.status.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
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
                  <Button variant="ghost" size="sm">
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
            Vous n'avez pas encore soumis de demande de subvention.
          </p>
        </div>
      )}
    </div>
  );
};
