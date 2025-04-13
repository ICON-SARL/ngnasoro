
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, UserPlus, Search } from 'lucide-react';
import { SfdStatusBadge } from '@/components/admin/sfd/SfdStatusBadge';
import { SfdActionsMenu } from '@/components/admin/sfd/SfdActionsMenu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatDate';
import { Skeleton } from '@/components/ui/skeleton';
import { useSfdData } from '@/components/admin/hooks/sfd-management/useSfdData';

export function SfdManagementTable() {
  const { sfds, isLoading, isError } = useSfdData();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Filter SFDs based on search term
  const filteredSfds = sfds.filter(sfd => 
    sfd.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sfd.email && sfd.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sfd.phone && sfd.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSuspendSfd = (sfd: any) => {
    console.log('Suspend SFD:', sfd.id);
    toast({
      title: "Action requise",
      description: "Cette fonctionnalité est en cours d'implémentation.",
      variant: "default",
    });
  };

  const handleReactivateSfd = (sfd: any) => {
    console.log('Reactivate SFD:', sfd.id);
    toast({
      title: "Action requise",
      description: "Cette fonctionnalité est en cours d'implémentation.",
      variant: "default",
    });
  };

  const handleActivateSfd = (sfd: any) => {
    console.log('Activate SFD:', sfd.id);
    toast({
      title: "Action requise",
      description: "Cette fonctionnalité est en cours d'implémentation.",
      variant: "default",
    });
  };

  const handleViewDetails = (sfd: any) => {
    console.log('View SFD details:', sfd.id);
    toast({
      title: "Action requise",
      description: "Cette fonctionnalité est en cours d'implémentation.",
      variant: "default",
    });
  };

  const handleAddAdmin = (sfd: any) => {
    console.log('Add admin to SFD:', sfd.id);
    toast({
      title: "Action requise",
      description: "Cette fonctionnalité est en cours d'implémentation.",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium">Liste des SFDs</h3>
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="border rounded-md">
          <div className="p-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center border rounded-md bg-red-50">
        <p className="text-red-600">Erreur lors du chargement des SFDs. Veuillez réessayer.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Rafraîchir la page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Liste des SFDs</h3>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une SFD..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSfds.length === 0 ? (
        <div className="bg-white rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Aucune SFD trouvée</p>
        </div>
      ) : (
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
              {filteredSfds.map((sfd) => (
                <TableRow key={sfd.id}>
                  <TableCell className="font-medium">{sfd.name}</TableCell>
                  <TableCell>{sfd.contact_email || sfd.email || '-'}</TableCell>
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddAdmin(sfd)}
                        className="ml-2"
                        title="Ajouter un administrateur"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(sfd)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <SfdActionsMenu
                        sfd={sfd}
                        onSuspend={handleSuspendSfd}
                        onReactivate={handleReactivateSfd}
                        onActivate={handleActivateSfd}
                        onEdit={() => console.log('Edit SFD:', sfd.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
