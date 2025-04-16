
import React from 'react';
import { Sfd } from '../types/sfd-types';
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
import { Edit, PowerOff, Power, Building, UserPlus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SfdTableProps {
  sfds: Sfd[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (sfd: Sfd) => void;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onActivate: (sfd: Sfd) => void;
  onViewDetails: (sfd: Sfd) => void;
}

export function SfdTable({
  sfds,
  isLoading,
  isError,
  onEdit,
  onSuspend,
  onReactivate,
  onActivate,
  onViewDetails,
}: SfdTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des SFDs.</p>
      </div>
    );
  }

  if (sfds.length === 0) {
    return (
      <div className="py-8 text-center">
        <Building className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">Aucun SFD trouvé.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Région</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sfds.map((sfd) => (
            <TableRow key={sfd.id}>
              <TableCell className="font-medium">{sfd.name}</TableCell>
              <TableCell>{sfd.code}</TableCell>
              <TableCell>{sfd.region}</TableCell>
              <TableCell>
                <StatusBadge status={sfd.status} />
              </TableCell>
              <TableCell>
                {sfd.created_at && format(new Date(sfd.created_at), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(sfd)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(sfd)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {sfd.status === 'active' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSuspend(sfd)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <PowerOff className="h-4 w-4" />
                    </Button>
                  ) : sfd.status === 'suspended' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReactivate(sfd)}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onActivate(sfd)}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Actif</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspendu</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
