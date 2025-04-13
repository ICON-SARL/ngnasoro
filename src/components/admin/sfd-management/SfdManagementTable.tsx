
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, UserPlus, Ban, CheckCircle, Power, Search } from 'lucide-react';
import { SfdStatusBadge } from '@/components/admin/sfd/SfdStatusBadge';
import { SfdActionsMenu } from '@/components/admin/sfd/SfdActionsMenu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatDate';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Sfd {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  admin_count?: number;
}

export function SfdManagementTable() {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchSfds = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sfds')
          .select('*')
          .order('name');

        if (error) throw error;

        // Count admins for each SFD
        const sfdsWithAdminCount = await Promise.all(
          data.map(async (sfd) => {
            // Get count of SFD admins
            const { count, error: countError } = await supabase
              .from('user_sfds')
              .select('*', { count: 'exact', head: true })
              .eq('sfd_id', sfd.id);

            if (countError) {
              console.error('Error counting admins:', countError);
              return { ...sfd, admin_count: 0 };
            }

            return { ...sfd, admin_count: count || 0 };
          })
        );

        setSfds(sfdsWithAdminCount);
      } catch (error) {
        console.error('Error fetching SFDs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des SFDs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, []);

  // Filter SFDs based on search term
  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sfd.email && sfd.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sfd.phone && sfd.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSuspendSfd = (sfd: Sfd) => {
    console.log('Suspend SFD:', sfd.id);
    // TODO: Implement suspend functionality
  };

  const handleReactivateSfd = (sfd: Sfd) => {
    console.log('Reactivate SFD:', sfd.id);
    // TODO: Implement reactivate functionality
  };

  const handleActivateSfd = (sfd: Sfd) => {
    console.log('Activate SFD:', sfd.id);
    // TODO: Implement activate functionality
  };

  const handleViewDetails = (sfd: Sfd) => {
    console.log('View SFD details:', sfd.id);
    // TODO: Implement view details functionality
  };

  const handleAddAdmin = (sfd: Sfd) => {
    console.log('Add admin to SFD:', sfd.id);
    // TODO: Implement add admin functionality
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
