
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { permissionsService } from '@/services/auth/permissionsService';
import { PERMISSIONS } from '@/utils/auth/roleTypes';
import { Check, X, Loader2 } from 'lucide-react';

interface RoleCheckerProps {
  userId: string;
  role: string;
}

export function RoleChecker({ userId, role }: RoleCheckerProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [runningTest, setRunningTest] = useState(false);

  // Key permissions to test for each role type
  const keyPermissions = {
    admin: [
      PERMISSIONS.VALIDATE_SFD_FUNDS,
      PERMISSIONS.MANAGE_SFDS,
      PERMISSIONS.PKI_MANAGEMENT,
      PERMISSIONS.CREATE_SFD,
      PERMISSIONS.AUDIT_REPORTS
    ],
    sfd_admin: [
      PERMISSIONS.CREATE_CLIENT_ACCOUNTS,
      PERMISSIONS.VALIDATE_CLIENT_ACCOUNTS,
      PERMISSIONS.MANAGE_SFD_LOANS,
      PERMISSIONS.APPROVE_CLIENT_ADHESION,
      PERMISSIONS.REJECT_CLIENT_ADHESION
    ],
    client: [
      PERMISSIONS.DEPOSIT_SAVINGS,
      PERMISSIONS.WITHDRAW_SAVINGS,
      PERMISSIONS.REQUEST_LOAN,
      PERMISSIONS.REPAY_LOAN,
      PERMISSIONS.REQUEST_ADHESION
    ],
    user: [
      PERMISSIONS.REQUEST_ADHESION
    ]
  };

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        const perms = await permissionsService.getUserPermissions(userId);
        setPermissions(perms);
        setError(null);
      } catch (err) {
        console.error('Error loading permissions:', err);
        setError('Erreur lors du chargement des permissions');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPermissions();
    }
  }, [userId]);

  const testRealTimePermissions = async () => {
    try {
      setRunningTest(true);
      const results: Record<string, boolean> = {};
      
      // Get permissions to test for this role
      const permissionsToTest = keyPermissions[role as keyof typeof keyPermissions] || [];
      
      // Test each permission in real-time
      for (const permission of permissionsToTest) {
        results[permission] = await permissionsService.hasPermission(userId, permission);
      }
      
      setTestResults(results);
    } catch (err) {
      console.error('Error testing permissions:', err);
      setError('Erreur lors des tests de permission en temps réel');
    } finally {
      setRunningTest(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vérification du Rôle: {role}</CardTitle>
        <CardDescription>
          Test en temps réel des permissions pour ce rôle
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Chargement des permissions...</span>
          </div>
        ) : error ? (
          <div className="text-destructive p-2">{error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Permissions chargées ({permissions.length}):</h3>
              <div className="flex flex-wrap gap-1">
                {permissions.map(perm => (
                  <Badge key={perm} variant="outline" className="text-xs">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
            
            {Object.keys(testResults).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Résultats des tests en temps réel:</h3>
                <div className="space-y-1">
                  {Object.entries(testResults).map(([perm, result]) => (
                    <div key={perm} className="flex items-center">
                      {result ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={testRealTimePermissions}
          disabled={loading || runningTest}
          className="w-full"
        >
          {runningTest && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Tester les permissions en temps réel
        </Button>
      </CardFooter>
    </Card>
  );
}
