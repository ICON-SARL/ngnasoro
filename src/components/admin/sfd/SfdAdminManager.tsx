
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSfdAdminManagement } from '@/components/admin/hooks/useSfdAdminManagement';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { Plus, Loader2, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isLoading, error, sfdAdmins, addSfdAdmin, deleteSfdAdmin, refetchAdmins } = useSfdAdminManagement();
  const { toast } = useToast();
  
  // Fetch admins on component mount
  useEffect(() => {
    refetchAdmins();
  }, [refetchAdmins]);
  
  // Filter admins for this specific SFD
  const filteredAdmins = sfdAdmins?.filter(admin => admin.sfd_id === sfdId) || [];

  const handleAddAdmin = (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => {
    addSfdAdmin(data, {
      onSuccess: () => {
        setShowAddDialog(false);
        toast({
          title: "Administrateur ajouté",
          description: `${data.full_name} a été ajouté comme administrateur pour ${sfdName}`
        });
      }
    });
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur ${adminName} ?`)) {
      deleteSfdAdmin(adminId, {
        onSuccess: () => {
          toast({
            title: "Administrateur supprimé",
            description: `${adminName} a été supprimé des administrateurs de ${sfdName}`
          });
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administrateurs SFD</CardTitle>
          <CardDescription>Gérer les administrateurs de la SFD {sfdName}</CardDescription>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un administrateur
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {filteredAdmins.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Aucun administrateur n'a été ajouté à cette SFD.
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter le premier administrateur
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="default" className={admin.has_2fa ? "bg-green-500 text-white" : ""}>
                      {admin.has_2fa ? "2FA activé" : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteAdmin(admin.id, admin.full_name)}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <AddSfdAdminDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          sfdId={sfdId}
          sfdName={sfdName}
          onAddAdmin={handleAddAdmin}
          isLoading={isLoading}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
