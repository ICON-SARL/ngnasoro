
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, User, Users, Key, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function RoleTestingPanel() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('client');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [sfdId, setSfdId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [sfds, setSfds] = useState<any[]>([]);
  const [tab, setTab] = useState<string>('create');
  const { toast } = useToast();

  // Fetch SFDs for the dropdown
  React.useEffect(() => {
    const fetchSfds = async () => {
      const { data, error } = await supabase.from('sfds').select('id, name, code').order('name');
      if (!error && data) {
        setSfds(data);
      }
    };
    
    fetchSfds();
  }, []);

  const createTestAccount = async () => {
    if (!email || !password || !fullName || (role === 'sfd_admin' && !sfdId)) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-roles', {
        body: {
          action: 'create_test_account',
          role,
          email,
          password,
          fullName,
          sfdId: role === 'sfd_admin' ? sfdId : undefined
        }
      });

      if (error) throw error;
      
      setResult(data);
      toast({
        title: "Compte créé",
        description: `Compte de test ${role} créé avec succès`,
      });
    } catch (error) {
      console.error('Error creating test account:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du compte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyRolePermissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-roles', {
        body: {
          action: 'verify_permissions',
          role
        }
      });

      if (error) throw error;
      
      setResult(data);
      toast({
        title: "Permissions vérifiées",
        description: `Permissions pour le rôle "${role}" récupérées avec succès`,
      });
    } catch (error) {
      console.error('Error verifying permissions:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la vérification des permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Test des Rôles et Permissions
        </CardTitle>
        <CardDescription>
          Créez des comptes de test ou vérifiez les permissions associées à chaque rôle
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="create" value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 mx-4">
          <TabsTrigger value="create">Créer un Compte Test</TabsTrigger>
          <TabsTrigger value="verify">Vérifier les Permissions</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rôles disponibles</SelectLabel>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-purple-500" />
                          Super Admin (MEREF)
                        </div>
                      </SelectItem>
                      <SelectItem value="sfd_admin">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Admin SFD
                        </div>
                      </SelectItem>
                      <SelectItem value="client">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          Client
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Nom et prénom"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="exemple@domaine.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Mot de passe"
                />
              </div>
              
              {role === 'sfd_admin' && (
                <div>
                  <Label htmlFor="sfd">SFD</Label>
                  <Select value={sfdId} onValueChange={setSfdId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une SFD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>SFDs disponibles</SelectLabel>
                        {sfds.map((sfd) => (
                          <SelectItem key={sfd.id} value={sfd.id}>
                            {sfd.name} ({sfd.code})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleToVerify">Rôle à vérifier</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rôles disponibles</SelectLabel>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-purple-500" />
                          Super Admin (MEREF)
                        </div>
                      </SelectItem>
                      <SelectItem value="sfd_admin">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Admin SFD
                        </div>
                      </SelectItem>
                      <SelectItem value="client">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          Client
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setResult(null);
          setEmail('');
          setPassword('');
          setFullName('');
          setSfdId('');
        }}>
          Réinitialiser
        </Button>
        
        <Button 
          disabled={loading} 
          onClick={tab === 'create' ? createTestAccount : verifyRolePermissions}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tab === 'create' ? 'Créer le compte' : 'Vérifier les permissions'}
        </Button>
      </CardFooter>
      
      {result && (
        <div className="px-6 pb-6 space-y-4">
          <div className="text-sm font-medium">Résultat :</div>
          
          {result.success && tab === 'create' && (
            <div className="border rounded-md p-4 bg-green-50 border-green-200 text-green-900">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="font-medium">Compte créé avec succès</div>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div><span className="font-medium">ID:</span> {result.user.id}</div>
                <div><span className="font-medium">Email:</span> {result.user.email}</div>
                <div><span className="font-medium">Nom:</span> {result.user.full_name}</div>
                <div><span className="font-medium">Rôle:</span> {result.user.role}</div>
              </div>
            </div>
          )}
          
          {result.success && tab === 'verify' && (
            <div className="border rounded-md p-4 bg-blue-50 border-blue-200 text-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-blue-600" />
                <div className="font-medium">Permissions pour le rôle "{result.role}"</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(result.permissions) ? (
                  result.permissions.map((permission: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-blue-100 border-blue-300 text-blue-800">
                      {permission}
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm italic">Aucune permission trouvée</div>
                )}
              </div>
              <div className="text-xs text-blue-700 mt-3">
                Source: {result.source === 'database' ? 'Base de données' : 'Définitions locales'}
              </div>
            </div>
          )}
          
          {!result.success && (
            <div className="border rounded-md p-4 bg-red-50 border-red-200 text-red-900">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div className="font-medium">Erreur : {result.error}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
