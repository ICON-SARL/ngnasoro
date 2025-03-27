
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Sfd } from '../types/sfd-types';
import { SfdLogo } from './SfdLogo';
import { SfdStatusBadge } from './SfdStatusBadge';
import { SfdActionsMenu } from './SfdActionsMenu';
import { Progress } from '@/components/ui/progress';

interface SfdTableProps {
  sfds: Sfd[] | null;
  isLoading: boolean;
  isError: boolean;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onEdit: (sfd: Sfd) => void;
  onViewDetails?: (sfd: Sfd) => void;
}

export function SfdTable({ 
  sfds, 
  isLoading, 
  isError, 
  onSuspend, 
  onReactivate,
  onEdit,
  onViewDetails
}: SfdTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Une erreur est survenue lors de la récupération des SFDs.
      </div>
    );
  }

  if (!sfds || sfds.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Aucune SFD trouvée avec les critères de filtrage actuels.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Région</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sfds?.map((sfd) => (
            <TableRow key={sfd.id}>
              <TableCell>
                <SfdLogo sfd={sfd} />
              </TableCell>
              <TableCell className="font-medium">{sfd.name}</TableCell>
              <TableCell>{sfd.code}</TableCell>
              <TableCell>{sfd.region || '-'}</TableCell>
              <TableCell>
                <SfdStatusBadge status={sfd.status} />
              </TableCell>
              <TableCell>
                <SfdActionsMenu 
                  sfd={sfd} 
                  onSuspend={onSuspend} 
                  onReactivate={onReactivate}
                  onEdit={onEdit}
                  onViewDetails={onViewDetails}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
