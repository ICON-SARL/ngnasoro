import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import JoinSfdSection from '@/components/mobile/account/JoinSfdSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, CreditCard, Wallet, Send, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSfdStatusCheck } from '@/hooks/useSfdStatusCheck';
import { SfdStatusAlert } from '@/components/admin/dashboard/SfdStatusAlert';
import { SimplifiedMerefDashboard } from '@/components/admin/dashboard/SimplifiedMerefDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileHomeProps {
  userAccount: any;
  isLoading: boolean;
}

const MobileHome: React.FC<MobileHomeProps> = ({ userAccount, isLoading }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isSfdAdmin } = useUserRole();
  const { sfdData } = useSfdDataAccess();
  const { sfdAccounts } = useSfdAccounts();
  const { synchronizeWithSfd, isSyncing } = useRealtimeSynchronization();
  const { data: sfdStatusData, isLoading: isCheckingSfdStatus } = useSfdStatusCheck();
  
  const showAdminDashboard = isAdmin || isSfdAdmin;
  const showSfdAlert = isAdmin && sfdStatusData?.activeSfdsCount === 0;
  const hasSfdAccounts = sfdAccounts && sfdAccounts.length > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Bonjour, {user?.user_metadata?.full_name || 'Utilisateur'}</h1>
      
      {/* Section pour rejoindre une SFD */}
      <JoinSfdSection />
      
      {/* Admin Dashboard */}
      {showAdminDashboard && (
        <div className="mb-6">
          {showSfdAlert && <SfdStatusAlert />}
          <SimplifiedMerefDashboard />
        </div>
      )}
      
      {/* Account Balance Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Solde du compte</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isSyncing ? (
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
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => synchronizeWithSfd()}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    'Actualiser le solde'
                  )}
                </Button>
              </div>
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
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/scan')}
            >
              <QrCode className="h-6 w-6 mb-2 text-purple-500" />
              <span>Scanner</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
              onClick={() => navigate('/mobile-flow/transactions')}
            >
              <CreditCard className="h-6 w-6 mb-2 text-amber-500" />
              <span>Transactions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* SFD Services */}
      {hasSfdAccounts && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Services SFD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/mobile-flow/sfd-savings')}
              >
                <span>Épargne</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/mobile-flow/sfd-loans')}
              >
                <span>Prêts</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/mobile-flow/sfd-services')}
              >
                <span>Autres services</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileHome;
