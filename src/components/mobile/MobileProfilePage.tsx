
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Bell, Settings, LogOut, CreditCard, PiggyBank, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const MobileProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { sfdData } = useSfdDataAccess();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Un problème est survenu lors de la déconnexion. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  // Extract user info
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const userEmail = user?.email || '';
  const phoneNumber = user?.phone || user?.user_metadata?.phone || '+223 XX XX XX XX';
  
  return (
    <div className="pb-20">
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0D6A51]/80 to-[#0D6A51]/20 text-white">
        <Avatar className="h-20 w-20 border-4 border-white mb-3">
          <AvatarImage src={user?.avatar_url} alt={userName} />
          <AvatarFallback className="bg-[#0D6A51] text-white text-xl">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-bold text-center">{userName}</h2>
        <p className="text-sm opacity-90">{userEmail}</p>
        <p className="text-sm opacity-90 mb-2">{phoneNumber}</p>
        
        <Badge className="bg-green-500/90 hover:bg-green-500 flex items-center gap-1 mt-2">
          <Shield className="h-3 w-3" />
          Compte vérifié
        </Badge>
      </div>
      
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="font-medium text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Mon profil
              </h3>
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/profile/edit')}
            >
              <span>Modifier mes informations</span>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/profile/verification')}
            >
              <span>Vérification d'identité</span>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="font-medium text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Activité financière
              </h3>
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/my-loans')}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span>Mes prêts</span>
              </div>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/savings')}
            >
              <div className="flex items-center">
                <PiggyBank className="h-4 w-4 mr-2 text-gray-500" />
                <span>Mes fonds</span>
              </div>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/transaction-history')}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>Historique des transactions</span>
              </div>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="font-medium text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Paramètres
              </h3>
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/profile/security')}
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-gray-500" />
                <span>Sécurité</span>
              </div>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/profile/notifications')}
            >
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-gray-500" />
                <span>Notifications</span>
              </div>
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </div>
            <Separator />
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 text-red-600"
              onClick={handleSignOut}
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Déconnexion</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {sfdData && sfdData.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="p-4">
                <h3 className="font-medium text-lg">Mes SFDs</h3>
              </div>
              <Separator />
              {sfdData.map((sfd, index) => (
                <React.Fragment key={sfd.id}>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sfd.name}</p>
                      <p className="text-sm text-muted-foreground">{sfd.code}</p>
                    </div>
                    {sfd.is_default !== undefined && sfd.is_default && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">Par défaut</Badge>
                    )}
                  </div>
                  {index < sfdData.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MobileProfilePage;
