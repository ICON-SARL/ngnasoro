
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import JoinSfdSection from '@/components/mobile/account/JoinSfdSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, CreditCard, Wallet, Send, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileHomeProps {
  userAccount: any;
  isLoading: boolean;
}

const MobileHome: React.FC<MobileHomeProps> = ({ userAccount, isLoading }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isSfdAdmin } = useUserRole();
  
  const showAdminDashboard = isAdmin || isSfdAdmin;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Bonjour, {user?.user_metadata?.full_name || 'Utilisateur'}</h1>
      
      {/* Section pour rejoindre une SFD */}
      <JoinSfdSection />
      
      {/* Admin Dashboard - Simplified version */}
      {showAdminDashboard && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tableau de bord administrateur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vous avez des fonctionnalités administrateur disponibles.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/admin-dashboard')}
              >
                Accéder au tableau de bord <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Account Balance Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Solde du compte</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold mb-1">
                {userAccount?.balance?.toLocaleString('fr-FR')} {userAccount?.currency || 'FCFA'}
              </div>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour: {new Date(userAccount?.updated_at || Date.now()).toLocaleString('fr-FR')}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/send-money')}
            >
              <Send className="h-6 w-6 mb-2 text-blue-500" />
              <span>Envoyer</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/receive-money')}
            >
              <Wallet className="h-6 w-6 mb-2 text-green-500" />
              <span>Recevoir</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileHome;
