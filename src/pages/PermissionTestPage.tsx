
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { verifyPermissionSystem, verifyUserRole } from '@/utils/auth/verifyPermissions';
import { RoleChecker } from '@/components/RoleChecker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { SystemActivation } from '@/components/SystemActivation';

const PermissionTestPage = () => {
  const { user, isAdmin, isSfdAdmin, isClient, userRole } = useAuth();
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('system');

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const status = await verifyPermissionSystem();
        setSystemStatus(status);
        
        if (user) {
          const userRoleStatus = await verifyUserRole(user.id);
          setUserStatus(userRoleStatus);
        }
      } catch (error) {
        console.error('Error checking system:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSystem();
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
    
    try {
      const status = await verifyPermissionSystem();
      setSystemStatus(status);
      
      if (user) {
        const userRoleStatus = await verifyUserRole(user.id);
        setUserStatus(userRoleStatus);
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Test de Permissions Système</h1>
      <p className="text-muted-foreground mb-6">
        Cette page permet de vérifier la configuration des permissions et des rôles dans l'application.
      </p>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Vérification des permissions...</span>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="system">Système</TabsTrigger>
                <TabsTrigger value="user">Utilisateur</TabsTrigger>
                <TabsTrigger value="activation">Activation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="system" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>État du système de permissions</CardTitle>
                    <CardDescription>
                      Vérification de la configuration des permissions dans la base de données
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemStatus ? (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          {systemStatus.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                          )}
                          <span className="font-medium">
                            {systemStatus.success 
                              ? 'Système de permissions opérationnel' 
                              : 'Problèmes détectés dans le système de permissions'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-md p-3">
                            <div className="text-sm font-medium mb-1">Vue de permissions</div>
                            <div className="flex items-center">
                              {systemStatus.viewExists ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                              )}
                              <span className="text-sm">
                                {systemStatus.viewExists ? 'Présente' : 'Manquante'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <div className="text-sm font-medium mb-1">Edge Function</div>
                            <div className="flex items-center">
                              {systemStatus.edgeFunctionWorks ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                              )}
                              <span className="text-sm">
                                {systemStatus.edgeFunctionWorks ? 'Fonctionnelle' : 'Non fonctionnelle'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <div className="text-sm font-medium mb-1">Rôles dans la base de données</div>
                          <div className="flex items-center">
                            <span className="text-xl font-bold mr-2">{systemStatus.roleCount}</span>
                            <span className="text-sm">rôles configurés</span>
                          </div>
                        </div>
                        
                        {!systemStatus.success && (
                          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                            <div className="font-medium mb-1">Actions recommandées:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {!systemStatus.viewExists && (
                                <li>Créer la vue role_permissions_view</li>
                              )}
                              {!systemStatus.edgeFunctionWorks && (
                                <li>Vérifier la fonction Edge test-roles</li>
                              )}
                              {systemStatus.roleCount === 0 && (
                                <li>Configurer des rôles dans la table user_roles</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Données non disponibles
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleRefresh} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rafraîchir
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="user">
                <div className="grid gap-4 grid-cols-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Votre profil utilisateur</CardTitle>
                      <CardDescription>
                        Informations sur votre compte et vos permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-md p-3">
                              <div className="text-sm font-medium mb-1">ID Utilisateur</div>
                              <div className="text-sm truncate">{user.id}</div>
                            </div>
                            
                            <div className="border rounded-md p-3">
                              <div className="text-sm font-medium mb-1">Email</div>
                              <div className="text-sm truncate">{user.email}</div>
                            </div>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <div className="text-sm font-medium mb-1">Rôle utilisateur</div>
                            <div className="flex gap-2">
                              {isAdmin && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                  Admin
                                </span>
                              )}
                              {isSfdAdmin && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  SFD Admin
                                </span>
                              )}
                              {isClient && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Client
                                </span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                {userRole || 'Non défini'}
                              </span>
                            </div>
                          </div>
                          
                          {userStatus && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Permissions:</div>
                              {userStatus.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {userStatus.permissions.map((perm: string) => (
                                    <span key={perm} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  Aucune permission spécifique
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Non connecté
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {userStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RoleChecker userId={user?.id || ''} role="admin" />
                      <RoleChecker userId={user?.id || ''} role="sfd_admin" />
                      <RoleChecker userId={user?.id || ''} role="client" />
                      <RoleChecker userId={user?.id || ''} role="user" />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activation">
                <SystemActivation />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Guide de configuration</CardTitle>
                <CardDescription>
                  Comment configurer correctement le système d'authentification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Migration SQL requise</h3>
                  <p className="text-sm text-muted-foreground">
                    Assurez-vous d'avoir exécuté les migrations SQL pour créer les tables de rôles et permissions.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">2. Fonctions Edge nécessaires</h3>
                  <p className="text-sm text-muted-foreground">
                    Déployez les fonctions Edge requises: test-roles, synchronize-user-roles et auth-manager.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">3. Activation du système</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilisez l'onglet "Activation" pour activer RLS sur les tables et synchroniser les rôles utilisateurs.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">4. Vérification</h3>
                  <p className="text-sm text-muted-foreground">
                    Une fois configuré, les tests des rôles devraient tous passer avec succès.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionTestPage;
