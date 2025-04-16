
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  Wallet,
  Building,
  Shield 
} from 'lucide-react';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SfdAdhesionSection from '@/components/mobile/account/SfdAdhesionSection';

const AccountPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Récupérer le solde du compte de l'utilisateur
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!user) return;
      
      try {
        setIsLoadingBalance(true);
        const { data, error } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setAccountBalance(data.balance);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du solde:', error);
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    fetchUserBalance();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de vous déconnecter',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Mon compte</h1>
        <p className="text-gray-500 text-sm">Gérer votre profil et vos paramètres</p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Profil utilisateur */}
        <Card>
          <CardContent className="p-4 flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src="/placeholder-avatar.png" alt="Avatar" />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user?.user_metadata?.full_name || 'Utilisateur'}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Solde du compte */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-[#0D6A51]" />
              Mon solde
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="flex justify-center py-2">
                <div className="h-6 w-6 border-2 border-t-transparent border-[#0D6A51] rounded-full animate-spin"></div>
              </div>
            ) : accountBalance !== null ? (
              <div className="py-2">
                <p className="text-2xl font-bold">{accountBalance.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-500">Solde disponible</p>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-sm text-gray-500">
                  Vous n'avez pas encore de compte d'épargne. Adhérez à une SFD pour en créer un.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Section d'adhésion SFD */}
        <SfdAdhesionSection />
        
        {/* Options de compte */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Options</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-start py-6 rounded-none border-b"
              onClick={() => navigate('/mobile-flow/my-loans')}
            >
              <CreditCard className="mr-3 h-5 w-5 text-gray-600" />
              Mes prêts
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start py-6 rounded-none border-b"
              onClick={() => navigate('/mobile-flow/settings')}
            >
              <Settings className="mr-3 h-5 w-5 text-gray-600" />
              Paramètres
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start py-6 rounded-none border-b"
              onClick={() => navigate('/mobile-flow/security')}
            >
              <Shield className="mr-3 h-5 w-5 text-gray-600" />
              Sécurité
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start py-6 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default AccountPage;
