
import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RolePermission {
  role_name: string;
  can_create_sfd: boolean;
  can_manage_admins: boolean;
  can_approve_loans: boolean;
  can_manage_clients: boolean;
}

export function RoleAuditSystem() {
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      // Call the edge function to audit roles
      const { data, error } = await supabase.functions.invoke('audit-roles', {
        body: { roles: ['SUPER_ADMIN', 'SFD_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER'] },
      });

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de récupérer les permissions: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Audit RBAC</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRoles} 
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Rôle</th>
              <th className="border px-4 py-2 text-center">Créer SFD</th>
              <th className="border px-4 py-2 text-center">Gérer Admins</th>
              <th className="border px-4 py-2 text-center">Approuver Prêts</th>
              <th className="border px-4 py-2 text-center">Gérer Clients</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => (
              <tr key={index} className="border-b">
                <td className="border px-4 py-2 font-medium">{role.role_name}</td>
                <td className="border px-4 py-2 text-center">
                  {role.can_create_sfd ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">✕</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-center">
                  {role.can_manage_admins ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">✕</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-center">
                  {role.can_approve_loans ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">✕</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-center">
                  {role.can_manage_clients ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">✕</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Vérification des permissions</h3>
            <p className="text-sm text-muted-foreground">
              Ce tableau montre les permissions attribuées à chaque rôle dans le système. 
              Les permissions sont essentielles pour garantir que seuls les utilisateurs autorisés 
              peuvent effectuer des actions spécifiques.
            </p>
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Note :</strong> Si les autorisations ne correspondent pas aux attentes, 
                consultez la base de données ou contactez l'administrateur système.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
