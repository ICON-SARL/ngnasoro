
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserPermissionsProps {
  showAll?: boolean;
}

const PERMISSION_NAMES: Record<string, string> = {
  // Admin permissions
  'access_admin_dashboard': 'Accès au tableau de bord admin',
  'manage_users': 'Gestion des utilisateurs',
  'manage_roles': 'Gestion des rôles',
  'manage_sfds': 'Gestion des SFDs',
  'approve_subsidies': 'Approbation des subventions',
  'view_all_reports': 'Consultation de tous les rapports',
  'manage_system_settings': 'Gestion des paramètres système',
  
  // SFD Admin permissions
  'access_sfd_dashboard': 'Accès au tableau de bord SFD',
  'manage_sfd_clients': 'Gestion des clients SFD',
  'manage_sfd_loans': 'Gestion des prêts SFD',
  'view_sfd_reports': 'Consultation des rapports SFD',
  'manage_sfd_users': 'Gestion des utilisateurs SFD',
  
  // User permissions
  'access_mobile_app': 'Accès à l\'application mobile',
  'manage_personal_profile': 'Gestion du profil personnel',
  'view_loan_options': 'Consultation des options de prêt',
  'apply_for_loans': 'Demande de prêts',
  'view_transactions': 'Consultation des transactions'
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
