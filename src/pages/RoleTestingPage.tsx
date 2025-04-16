import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/hooks/auth/types';
import { Shield, User, Building, AlertTriangle } from 'lucide-react';

const RoleTestingPage = () => {
  const { user, userRole } = useAuth();

  const testRoles = [
    { id: 'super_admin', name: 'Super Admin', role: UserRole.SuperAdmin, icon: Shield, color: 'amber' },
    { id: 'sfd_admin', name: 'SFD Admin', role: UserRole.SfdAdmin, icon: Building, color: 'blue' },
    { id: 'client', name: 'Client', role: UserRole.Client, icon: User, color: 'green' },
  ];

  const checkRoleAccess = (role: string) => {
    return userRole === role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Test des Rôles et Permissions</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Votre Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID Utilisateur:</strong> {user?.id || 'Non connecté'}</p>
              <p><strong>Email:</strong> {user?.email || 'Non disponible'}</p>
              <p><strong>Rôle actuel:</strong> <span className="font-semibold">{userRole}</span></p>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {testRoles.map((roleInfo) => (
            <Card key={roleInfo.id} className={`border-${roleInfo.color}-200 ${checkRoleAccess(roleInfo.role) ? `bg-${roleInfo.color}-50` : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 bg-${roleInfo.color}-100 text-${roleInfo.color}-600 rounded-full flex items-center justify-center`}>
                    <roleInfo.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">{roleInfo.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  {checkRoleAccess(roleInfo.role) 
                    ? "Vous avez accès à ce rôle." 
                    : "Vous n'avez pas accès à ce rôle."}
                </p>
                <Button 
                  variant={checkRoleAccess(roleInfo.role) ? "default" : "outline"}
                  className={checkRoleAccess(roleInfo.role) ? `bg-${roleInfo.color}-600 hover:bg-${roleInfo.color}-700` : ""}
                  disabled={!checkRoleAccess(roleInfo.role)}
                >
                  Tester l'accès
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Zone de test des permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Cette section permet de tester différentes fonctionnalités selon les rôles.
              Utilisez ces boutons avec précaution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                Simuler erreur d'autorisation
              </Button>
              <Button variant="outline" className="border-amber-200 text-amber-600 hover:bg-amber-50">
                Tester accès API protégé
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Vérifier permissions SFD
              </Button>
              <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                Tester fonctions client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleTestingPage;
