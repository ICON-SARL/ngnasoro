
import React, { useState } from 'react';
import { useSuperAdminManagement } from '@/hooks/useSuperAdminManagement';
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
import { 
  Loader2, 
  RefreshCw, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar, 
  Check, 
  AlertTriangle,
  MoreHorizontal,
  Edit,
  KeyRound,
  UserX,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { usePermissions } from '@/hooks/auth/usePermissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

export function AdminUsersList() {
  const { admins, isLoading, error, refetchAdmins } = useSuperAdminManagement();
  const { hasPermission } = usePermissions();
  const canManageUsers = hasPermission('manage_users');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des administrateurs...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
        <p className="text-red-700">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={refetchAdmins}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  const handleEditAdmin = (admin: any) => {
    navigate(`/admin/users/edit/${admin.id}`);
  };

  const handleResetPassword = (admin: any) => {
    setSelectedAdmin(admin);
    setIsResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    setIsProcessing(true);
    try {
      // Simuler une attente pour l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Montrer un toast de succès
      toast({
        title: "Réinitialisation du mot de passe",
        description: `Un email de réinitialisation a été envoyé à ${selectedAdmin?.email}`,
        variant: "default",
      });
      
      setIsResetPasswordDialogOpen(false);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation du mot de passe",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (admin: any) => {
    try {
      // Simuler une attente pour l'API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Montrer un toast de succès
      toast({
        title: "Statut modifié",
        description: `${admin.full_name} est maintenant ${admin.is_active ? 'désactivé' : 'activé'}`,
        variant: "default",
      });
      
      // Rafraîchir la liste pour voir les changements
      refetchAdmins();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du statut",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Liste des Administrateurs</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetchAdmins}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {canManageUsers && (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel Admin
            </Button>
          )}
        </div>
      </div>
      
      {admins.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucun administrateur trouvé</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Dernière Connexion</TableHead>
                <TableHead>Authentification 2FA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'admin' ? 'destructive' : 'default'}>
                      {admin.role === 'admin' ? 'Super Admin' : 'SFD Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {admin.last_sign_in_at 
                        ? formatDate(admin.last_sign_in_at)
                        : 'Jamais connecté'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {admin.has_2fa ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Activée
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Non activée
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManageUsers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Réinitialiser mot de passe
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                            {admin.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2 text-red-600" />
                                <span className="text-red-600">Désactiver</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                <span className="text-green-600">Activer</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de réinitialisation de mot de passe */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Un lien de réinitialisation sera envoyé à l'adresse email de {selectedAdmin?.full_name} ({selectedAdmin?.email}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={isProcessing} onClick={() => setIsResetPasswordDialogOpen(false)}>
              Annuler
            </Button>
            <Button disabled={isProcessing} onClick={confirmResetPassword}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer le lien"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
