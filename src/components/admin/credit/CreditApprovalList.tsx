
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, FileCheck, FileX } from 'lucide-react';
import { CreditRequest } from '@/hooks/useCreditRequests';

interface CreditApprovalListProps {
  requests: CreditRequest[];
  onSelectRequest: (request: CreditRequest) => void;
  onApproveRequest: (request: CreditRequest) => void;
  onRejectRequest: (request: CreditRequest) => void;
}

export function CreditApprovalList({
  requests,
  onSelectRequest,
  onApproveRequest,
  onRejectRequest
}: CreditApprovalListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>SFD</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Objet</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.reference}</TableCell>
            <TableCell>{request.sfd_name}</TableCell>
            <TableCell>{request.amount.toLocaleString('fr-FR')} FCFA</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <div 
                  className={`h-2 w-2 rounded-full ${
                    request.risk_score >= 80 ? 'bg-green-500' : 
                    request.risk_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
                {request.risk_score}
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={request.purpose}>
              {request.purpose}
            </TableCell>
            <TableCell>
              {format(new Date(request.created_at), 'dd MMM yyyy', { locale: fr })}
            </TableCell>
            <TableCell>
              <Badge variant={
                request.status === 'approved' ? 'default' :
                request.status === 'rejected' ? 'destructive' : 'outline'
              }>
                {request.status === 'approved' ? 'Approuvé' :
                 request.status === 'rejected' ? 'Rejeté' : 'En attente'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {request.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => onApproveRequest(request)}
                    variant="outline"
                    size="sm"
                    className="text-green-600"
                  >
                    <FileCheck className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    onClick={() => onRejectRequest(request)}
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                  >
                    <FileX className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              )}
              <Button
                onClick={() => onSelectRequest(request)}
                variant="ghost"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
