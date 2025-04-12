
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search, Shield, AlertTriangle } from 'lucide-react';
import { useRoleAudit } from './hooks/useRoleAudit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logAuditEvent } from '@/utils/audit';

export function RoleAuditSystem() {
  const { 
    roles, 
    isLoading, 
    error, 
    runAudit,
    searchQuery,
    setSearchQuery,
    filteredRoles
  } = useRoleAudit();

  useEffect(() => {
    // Log component mount for audit purposes
    logAuditEvent({
      category: 'security',
      action: 'view_role_audit',
      metadata: {
        component: 'RoleAuditSystem',
        action: 'component_mounted'
      }
    });
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit du Système RBAC</CardTitle>
              <CardDescription>
                Vérifiez les rôles et permissions des utilisateurs
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={isLoading}
              onClick={() => runAudit()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom de rôle ou permission..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Nom du Rôle</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Aucun résultat trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className={`h-4 w-4 ${
                              role.type === 'SUPER_ADMIN' 
                                ? 'text-red-500' 
                                : role.type === 'SFD_ADMIN' 
                                ? 'text-amber-500'
                                : 'text-blue-500'
                            }`} />
                            {role.type}
                          </div>
                        </TableCell>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((perm, idx) => (
                              <span 
                                key={idx} 
                                className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              logAuditEvent({
                                category: 'security',
                                action: 'view_role_details',
                                metadata: {
                                  role_id: role.id,
                                  role_name: role.name
                                }
                              });
                            }}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-4">
            <p>Ce module d'audit permet de vérifier l'intégrité des rôles et permissions du système.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
