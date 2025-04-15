
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, Key } from 'lucide-react';
import { verifyUserRole } from '@/utils/auth/verifyPermissions';
import { Badge } from '@/components/ui/badge';

export function RoleTester() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const roleInfo = await verifyUserRole(userId);
      setResult(roleInfo);
    } catch (err) {
      console.error("Erreur lors de la vérification:", err);
      setResult({
        error: err.message || "Une erreur est survenue"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Testeur de rôle utilisateur
        </CardTitle>
        <CardDescription>
          Vérifiez les permissions d'un utilisateur spécifique
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="userId">ID Utilisateur</Label>
          <div className="flex gap-2">
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Entrez l'ID de l'utilisateur à tester"
            />
            <Button 
              onClick={handleTest} 
              disabled={!userId || loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Vérifier
            </Button>
          </div>
        </div>
        
        {result && !result.error && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Rôle: </span>
              <Badge variant="outline" className="ml-2">
                {result.role}
              </Badge>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <Key className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">Permissions ({result.permissions.length}):</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {result.permissions.map((permission: string) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {result && result.error && (
          <div className="mt-4 text-destructive">
            <p>Erreur: {result.error}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Utilisez l'ID de l'utilisateur pour vérifier son rôle et ses permissions.
        </p>
      </CardFooter>
    </Card>
  );
}
