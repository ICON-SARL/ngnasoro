
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Power, PowerOff } from 'lucide-react';
import { Sfd } from '@/hooks/useSfdManagement';

interface SfdTableProps {
  sfds: Sfd[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (sfd: Sfd) => void;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onActivate: (sfd: Sfd) => void;
  onViewDetails?: (sfd: Sfd) => void;
}

export function SfdTable({
  sfds,
  isLoading,
  isError,
  onEdit,
  onSuspend,
  onReactivate,
  onActivate
}: SfdTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline"; label: string } } = {
      active: { variant: "default", label: "Actif" },
      inactive: { variant: "secondary", label: "Inactif" },
      suspended: { variant: "destructive", label: "Suspendu" },
      pending: { variant: "outline", label: "En attente" }
    };
    
    const { variant, label } = variants[status] || variants.inactive;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Région</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sfds.map((sfd) => (
            <TableRow key={sfd.id}>
              <TableCell className="font-medium">{sfd.name}</TableCell>
              <TableCell>{sfd.code}</TableCell>
              <TableCell>{sfd.region || '-'}</TableCell>
              <TableCell>{getStatusBadge(sfd.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(sfd)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {sfd.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSuspend(sfd)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <PowerOff className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {(sfd.status === 'suspended' || sfd.status === 'inactive') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReactivate(sfd)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {sfd.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onActivate(sfd)}
                      className="text-green-600 hover:text-green-700"
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
