
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AdminUser, AdminRole } from './types';
import { Switch } from '@/components/ui/switch';
import { Edit, KeyRound } from 'lucide-react';

interface AdminTableProps {
  admins: AdminUser[];
  onToggleStatus: (admin: AdminUser, isActive: boolean) => void;
  onResetPassword: (admin: AdminUser) => void;
  onEditAdmin: (admin: AdminUser) => void;
  isLoading?: boolean;
}

export const AdminTable: React.FC<AdminTableProps> = ({ 
  admins, 
  onToggleStatus, 
  onResetPassword, 
  onEditAdmin,
  isLoading = false
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getRoleBadgeColor = (role: AdminRole) => {
    switch(role) {
      case AdminRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-700';
      case AdminRole.SFD_ADMIN:
        return 'bg-blue-100 text-blue-700';
      case AdminRole.SUPPORT:
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getRoleLabel = (role: AdminRole) => {
    switch(role) {
      case AdminRole.SUPER_ADMIN:
        return 'Super Admin';
      case AdminRole.SFD_ADMIN:
        return 'Admin SFD';
      case AdminRole.SUPPORT:
        return 'Support';
      default:
        return role;
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>SFD Associée</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière Connexion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Aucun administrateur trouvé
              </TableCell>
            </TableRow>
          ) : (
            admins.map(admin => (
              <TableRow key={admin.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEditAdmin(admin)}>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleBadgeColor(admin.role)}>
                    {getRoleLabel(admin.role)}
                  </Badge>
                </TableCell>
                <TableCell>{admin.sfd_name || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center" onClick={e => e.stopPropagation()}>
                    <Switch 
                      checked={admin.is_active} 
                      onCheckedChange={(checked) => onToggleStatus(admin, checked)}
                    />
                    <span className="ml-2 text-sm">
                      {admin.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(admin.last_login)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => onEditAdmin(admin)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onResetPassword(admin)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
