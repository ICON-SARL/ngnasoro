
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, UserPlus, Ban, CheckCircle } from 'lucide-react';
import { Sfd } from '../types/sfd-types';
import { formatDate } from '@/utils/formatDate';

interface SfdTableProps {
  sfds: Sfd[];
  isLoading: boolean;
  isError: boolean;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onEdit: (sfd: Sfd) => void;
  onViewDetails: (sfd: Sfd) => void;
  onAddAdmin?: (sfd: Sfd) => void;
}

export function SfdTable({ 
  sfds, 
  isLoading, 
  isError, 
  onSuspend, 
  onReactivate, 
  onEdit, 
  onViewDetails,
  onAddAdmin
}: SfdTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Chargement des SFDs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 rounded-md border border-red-200 p-8 text-center">
        <p className="text-red-600">Une erreur est survenue lors du chargement des SFDs</p>
      </div>
    );
  }

  if (sfds.length === 0) {
    return (
      <div className="bg-white rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Aucune SFD trouvée</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sfds.map((sfd) => (
            <TableRow key={sfd.id}>
              <TableCell className="font-medium">{sfd.name}</TableCell>
              <TableCell>{sfd.email || '-'}</TableCell>
              <TableCell>{sfd.phone || '-'}</TableCell>
              <TableCell>
                <Badge 
                  className={
                    sfd.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : sfd.status === 'suspended' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {sfd.status === 'active' 
                    ? 'Active' 
                    : sfd.status === 'suspended'
                    ? 'Suspendue'
                    : 'En attente'
                  }
                </Badge>
              </TableCell>
              <TableCell>
                {sfd.created_at ? formatDate(sfd.created_at) : '-'}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewDetails(sfd)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onAddAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onAddAdmin(sfd)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
                {sfd.status === 'active' ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSuspend(sfd)}
                    className="text-red-600"
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                ) : sfd.status === 'suspended' ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onReactivate(sfd)}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
