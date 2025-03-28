
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (!error) {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté",
        });
        navigate('/auth');
      } else {
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-muted-foreground">Gérer vos informations personnelles</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="flex">
                    <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0 border-input">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="fullName" 
                      value={user?.full_name || ''} 
                      readOnly 
                      className="rounded-l-none focus-visible:ring-0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex">
                    <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0 border-input">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      readOnly
                      className="rounded-l-none focus-visible:ring-0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="flex">
                    <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0 border-input">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="phone" 
                      value={user?.phone || 'Non renseigné'} 
                      readOnly
                      className="rounded-l-none focus-visible:ring-0"
                    />
                  </div>
                </div>
                
                {!isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="sfd">SFD</Label>
                    <div className="flex">
                      <div className="bg-muted p-2 flex items-center rounded-l-md border border-r-0 border-input">
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input 
                        id="sfd" 
                        value={"SFD ID: " + (user?.sfd_id || 'Non assigné')}
                        readOnly
                        className="rounded-l-none focus-visible:ring-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="changePassword">Changer de mot de passe</Label>
                <Button id="changePassword" variant="outline" className="w-full">
                  Modifier le mot de passe
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twoFactor">Authentification à deux facteurs</Label>
                <Button id="twoFactor" variant="outline" className="w-full">
                  Configurer l'authentification à deux facteurs
                </Button>
              </div>
              
              <div className="pt-4">
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  Déconnecter toutes les sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
