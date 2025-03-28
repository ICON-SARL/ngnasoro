
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Permission } from '@/hooks/auth/types';

interface UserPermissionsProps {
  showAll?: boolean;
}

// Map of permission keys to human-readable names
const PERMISSION_NAMES: Record<string, string> = {
  // Admin permissions
  'access_admin_panel': 'Accès au tableau de bord admin',
  'manage_users': 'Gestion des utilisateurs',
  'manage_sfds': 'Gestion des SFDs',
  'manage_roles': 'Gestion des rôles',
  'approve_subsidies': 'Approbation des subventions',
  'view_audit_logs': 'Consultation des journaux d\'audit',
  'manage_system_settings': 'Paramètres système',
  
  // SFD Admin permissions
  'access_sfd_panel': 'Accès au tableau de bord SFD',
  'manage_sfd_clients': 'Gestion des clients SFD',
  'manage_sfd_loans': 'Gestion des prêts SFD',
  'view_sfd_subsidies': 'Consultation des subventions SFD',
  'view_sfd_reports': 'Rapports SFD',
  
  // User permissions
  'access_mobile_app': 'Accès à l\'application mobile',
  'apply_for_loans': 'Demande de prêts',
  'make_transfers': 'Effectuer des transferts',
  'view_transactions': 'Voir les transactions',
  'manage_personal_profile': 'Gérer le profil personnel'
};

const ALL_PERMISSIONS = Object.keys(PERMISSION_NAMES);

export function UserPermissions({ showAll = false }: UserPermissionsProps) {
  const { userRole, hasPermission } = useAuth();
  
  if (!userRole) {
    return null;
  }
  
  const roleName = 
    userRole === 'admin' ? 'Super Admin' : 
    userRole === 'sfd_admin' ? 'Admin SFD' : 
    'Utilisateur Standard';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#0D6A51]" />
          Vos permissions ({roleName})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          {ALL_PERMISSIONS.map(permission => {
            const userHasPermission = hasPermission(permission);
            
            // Skip permissions the user doesn't have unless showAll is true
            if (!userHasPermission && !showAll) {
              return null;
            }
            
            return (
              <div 
                key={permission} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  userHasPermission ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <span className="text-sm">{PERMISSION_NAMES[permission]}</span>
                <Badge variant="outline" className={userHasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}>
                  {userHasPermission ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {userHasPermission ? 'Autorisé' : 'Non autorisé'}
                </Badge>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </CardContent>
    </Card>
  );
}
