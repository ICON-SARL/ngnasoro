
import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermissionsListProps {
  roleName: string;
}

const ROLE_PERMISSIONS = {
  'admin': [
    'access_admin_dashboard',
    'manage_users',
    'manage_roles',
    'manage_sfds',
    'approve_subsidies',
    'view_all_reports',
    'manage_system_settings'
  ],
  'sfd_admin': [
    'access_sfd_dashboard',
    'manage_sfd_clients',
    'manage_sfd_loans',
    'view_sfd_reports',
    'manage_sfd_users'
  ],
  'user': [
    'access_mobile_app',
    'manage_personal_profile',
    'view_loan_options',
    'apply_for_loans',
    'view_transactions'
  ]
};

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

const ALL_PERMISSIONS = [
  ...ROLE_PERMISSIONS.admin,
  ...ROLE_PERMISSIONS.sfd_admin.filter(p => !ROLE_PERMISSIONS.admin.includes(p)),
  ...ROLE_PERMISSIONS.user.filter(p => 
    !ROLE_PERMISSIONS.admin.includes(p) && 
    !ROLE_PERMISSIONS.sfd_admin.includes(p)
  )
];

export function PermissionsList({ roleName }: PermissionsListProps) {
  const permissions = ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS] || [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-[#0D6A51]" />
        <h3 className="font-medium">Permissions pour le rôle: {roleName}</h3>
      </div>
      
      <div className="grid gap-2 md:grid-cols-2">
        {ALL_PERMISSIONS.map(permission => {
          const hasPermission = permissions.includes(permission);
          
          return (
            <div 
              key={permission} 
              className={`flex items-center justify-between p-2 rounded-md ${
                hasPermission ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <span className="text-sm">{PERMISSION_NAMES[permission] || permission}</span>
              <Badge variant="outline" className={hasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}>
                {hasPermission ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {hasPermission ? 'Autorisé' : 'Non autorisé'}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
