
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Role {
  role_name: string;
  can_create_sfd: boolean;
  can_manage_admins: boolean;
  can_approve_loans: boolean;
  can_manage_clients: boolean;
}

export function RoleAuditSystem() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation - in production, this would call your edge function
      // to run the SQL query: SELECT * FROM roles WHERE role_name IN ('SUPER_ADMIN', 'SFD_ADMIN')
      const { data: rolesData, error: rolesError } = await supabase.functions.invoke('audit-roles', {
        body: { roles: ['SUPER_ADMIN', 'SFD_ADMIN'] }
      });
      
      if (rolesError) throw new Error(rolesError.message);
      
      if (rolesData) {
        setRoles(rolesData);
      } else {
        // Fallback mock data for demonstration
        setRoles([
          { 
            role_name: 'SUPER_ADMIN', 
            can_create_sfd: true, 
            can_manage_admins: true,
            can_approve_loans: true,
            can_manage_clients: true
          },
          { 
            role_name: 'SFD_ADMIN', 
            can_create_sfd: false, 
            can_manage_admins: true,
            can_approve_loans: true,
            can_manage_clients: true
          }
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'Failed to fetch role permissions');
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les permissions des rôles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Audit RBAC
          </CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRoles}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rôle</TableHead>
              <TableHead>Créer SFD</TableHead>
              <TableHead>Gérer Admins</TableHead>
              <TableHead>Approuver Prêts</TableHead>
              <TableHead>Gérer Clients</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.role_name}>
                <TableCell>
                  <Badge variant={role.role_name === 'SUPER_ADMIN' ? 'default' : 'outline'}>
                    {role.role_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {role.can_create_sfd ? 
                    <Check className="text-green-500 h-5 w-5" /> : 
                    <X className="text-red-500 h-5 w-5" />}
                </TableCell>
                <TableCell>
                  {role.can_manage_admins ? 
                    <Check className="text-green-500 h-5 w-5" /> : 
                    <X className="text-red-500 h-5 w-5" />}
                </TableCell>
                <TableCell>
                  {role.can_approve_loans ? 
                    <Check className="text-green-500 h-5 w-5" /> : 
                    <X className="text-red-500 h-5 w-5" />}
                </TableCell>
                <TableCell>
                  {role.can_manage_clients ? 
                    <Check className="text-green-500 h-5 w-5" /> : 
                    <X className="text-red-500 h-5 w-5" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
