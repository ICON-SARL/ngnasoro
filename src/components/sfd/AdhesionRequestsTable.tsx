
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { Loader } from '@/components/ui/loader';

interface AdhesionRequestsTableProps {
  requests: ClientAdhesionRequest[];
  isLoading: boolean;
  onApprove?: (request: ClientAdhesionRequest) => void;
  onReject?: (request: ClientAdhesionRequest) => void;
}

export function AdhesionRequestsTable({ 
  requests, 
  isLoading,
  onApprove,
  onReject
}: AdhesionRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader size="lg" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucune demande trouvée dans cette catégorie.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_validation':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-50 text-green-700">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{request.full_name}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-1 text-gray-500" />
                  {request.email}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-1 text-gray-500" />
                  {request.phone}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {formatDate(request.created_at)}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {(request.status === 'pending' || request.status === 'pending_validation') && onApprove && onReject && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => onApprove(request)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => onReject(request)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
