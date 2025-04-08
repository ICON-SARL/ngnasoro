
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, UserPlus, Ban, CheckCircle, Power } from 'lucide-react';
import { Sfd } from '../types/sfd-types';
import { formatDate } from '@/utils/formatDate';
import { SfdStatusBadge } from './SfdStatusBadge';
import { SfdActionsMenu } from './SfdActionsMenu';

interface SfdTableProps {
  sfds: Sfd[];
  isLoading: boolean;
  isError: boolean;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onActivate: (sfd: Sfd) => void;
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
  onActivate,
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
            <TableHead>Admins</TableHead>
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
                <SfdStatusBadge status={sfd.status || 'pending'} />
              </TableCell>
              <TableCell>
                {sfd.created_at ? formatDate(sfd.created_at) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="text-sm">{sfd.admin_count || 0}</span>
                  {onAddAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onAddAdmin(sfd)}
                      className="ml-2"
                      title="Ajouter un administrateur"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewDetails(sfd)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <SfdActionsMenu
                    sfd={sfd}
                    onSuspend={onSuspend}
                    onReactivate={onReactivate}
                    onActivate={onActivate}
                    onEdit={onEdit}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
