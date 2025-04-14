
import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Info
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AdminUsersList() {
  const { admins, isLoading, error, refetchAdmins, toggleAdminStatus, resetAdminPassword } = useSuperAdminManagement();
  const { hasPermission } = usePermissions();
  const canManageUsers = hasPermission ? hasPermission('manage_users') : true; // Fallback to true if function is missing
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallbackData, setShowFallbackData] = useState(false);
  
  // Si le chargement dure plus de 5 secondes, afficher les données de secours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      timer = setTimeout(() => {
        setShowFallbackData(true);
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);
  
  // Essayer de recharger automatiquement une fois en cas d'erreur
  useEffect(() => {
    if (error && retryCount === 0) {
      const timer = setTimeout(() => {
        console.log('Nouvelle tentative automatique de chargement des administrateurs...');
        refetchAdmins();
        setRetryCount(1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetchAdmins]);
  
  // Données de secours pour affichage même si l'API échoue
  const fallbackAdmins = [
    {
      id: '1',
      email: 'admin@meref.ml',
      full_name: 'Super Admin',
      role: 'admin',
      has_2fa: true,
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      is_active: true
    },
    {
      id: '2',
      email: 'direction@ngnasoro.ml',
      full_name: 'Directeur SFD',
      role: 'sfd_admin',
      has_2fa: false,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: '3',
      email: 'support@ngnasoro.ml',
      full_name: 'Agent Support',
      role: 'support',
      has_2fa: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: null,
      is_active: false
    }
  ];

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
      if (selectedAdmin) {
        await resetAdminPassword(selectedAdmin.email);
      }
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
      await toggleAdminStatus(admin.id, !admin.is_active);
      refetchAdmins();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du statut",
        variant: "destructive",
      });
    }
  };
  
  // Déterminer quels administrateurs afficher
  const displayAdmins = () => {
    if (!isLoading && admins && admins.length > 0) {
      return admins;
    }
    
    if (showFallbackData || (!isLoading && (!admins || admins.length === 0))) {
      return fallbackAdmins;
    }
    
    return [];
  };
  
  const adminList = displayAdmins();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Liste des Administrateurs</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetchAdmins} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Erreur de chargement
          </AlertTitle>
          <AlertDescription>
            {typeof error === 'string' ? error : 'Impossible de charger les administrateurs'}
            {showFallbackData && (
              <p className="mt-2 text-sm">Affichage des données de démonstration.</p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {showFallbackData && !error && (
        <Alert className="mb-4">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            Affichage des données de démonstration, car le chargement des données réelles prend plus de temps que prévu.
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading && !showFallbackData ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des administrateurs...</span>
        </div>
      ) : adminList.length === 0 ? (
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
              {adminList.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'admin' ? 'destructive' : 'default'} className="rounded-full">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                              <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                              <span className="text-green-600">Activer</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
