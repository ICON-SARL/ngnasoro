
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { RoleChecker } from '@/components/RoleChecker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, User, Shield, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const RoleTestingDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("ID utilisateur manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user data
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          userId
        );
        
        if (userError || !userData) {
          throw new Error(userError?.message || "Utilisateur non trouvé");
        }
        
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
          
        const role = roleData?.role || userData.user.app_metadata?.role || 'user';
        
        setUser({
          ...userData.user,
          role
        });
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || "Erreur lors de la récupération des données de l'utilisateur");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Test Détaillé des Permissions</h1>
        
        {loading ? (
          <Card>
            <CardContent className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement...</span>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : user ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Informations utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">ID:</span> {user.id}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">Nom:</span> {user.user_metadata?.full_name || 'Non défini'}
                </div>
                <div>
                  <span className="font-medium">Rôle:</span>{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Créé le:</span> {new Date(user.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Dernière connexion:</span> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Jamais'}
                </div>
              </CardContent>
            </Card>
            
            <RoleChecker userId={user.id} role={user.role} />
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-primary" />
                  Test en temps réel des permissions
                </CardTitle>
                <CardDescription>
                  Cette section vous permet de vérifier si l'utilisateur a les permissions nécessaires pour effectuer différentes actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Les tests de permissions vérifient directement avec la base de données si l'utilisateur a les permissions requises, 
                  en passant par des fonctions de sécurité définies dans Supabase.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => navigate('/role-test')}>
                  Retour à la page de test des rôles
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Aucune donnée d'utilisateur trouvée</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default RoleTestingDetailPage;
