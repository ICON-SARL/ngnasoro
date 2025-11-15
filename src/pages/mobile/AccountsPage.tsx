import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import SfdAccountItem from '@/components/mobile/profile/sfd-accounts/SfdAccountItem';
import { useToast } from '@/hooks/use-toast';
import { FundsActionSheet } from '@/components/mobile/funds/FundsActionSheet';
import { CashierQRScanner } from '@/components/mobile/funds/CashierQRScanner';
import MobileMoneyModal from '@/components/mobile/loan/MobileMoneyModal';
import { Dialog } from '@/components/ui/dialog';

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId, setActiveSfdId } = useAuth();
  const { toast } = useToast();
  
  // États pour gérer les modaux de fonds
  const [fundsActionType, setFundsActionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [showFundsSheet, setShowFundsSheet] = useState(false);
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const { 
    sfds: sfdData, 
    isLoading: sfdLoading 
  } = useSfdDataAccess();

  // Query pour récupérer le solde total de TOUS les comptes du client
  const { data: totalBalanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['user-total-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, currency: 'FCFA' };
      
      // Récupérer tous les comptes de l'utilisateur, tous SFDs confondus
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('balance, currency')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const total = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
      return { total, currency: accounts?.[0]?.currency || 'FCFA' };
    },
    enabled: !!user?.id
  });

  const isLoading = sfdLoading || balanceLoading;

  const handleSwitchSfd = async (sfdId: string) => {
    if (sfdId === activeSfdId) return;
    
    try {
      setActiveSfdId(sfdId);
      
      const selectedSfd = sfdData.find(sfd => sfd.id === sfdId);
      toast({
        title: "SFD changée",
        description: `Vous êtes maintenant connecté à ${selectedSfd?.name || 'cette SFD'}`,
      });
    } catch (error) {
      console.error('Error switching SFD:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer de SFD pour le moment",
        variant: "destructive"
      });
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-8">
          <Skeleton className="w-8 h-8 rounded-full mb-4" />
          <Skeleton className="w-40 h-8 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="px-4 -mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Mes Comptes</h1>
        <p className="text-sm opacity-90">
          Gérez tous vos comptes en un seul endroit
        </p>
      </div>

      {/* Total balance card */}
      <div className="px-4 -mt-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#fcb041] via-[#fdc158] to-[#fcb041]/90 rounded-3xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm opacity-90">Solde total</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            {formatBalance(totalBalanceData?.total || 0)} {totalBalanceData?.currency}
          </h2>
          
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setFundsActionType('deposit');
                setShowFundsSheet(true);
              }}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 rounded-2xl"
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Recharger
            </Button>
            <Button
              onClick={() => {
                setFundsActionType('withdrawal');
                setShowFundsSheet(true);
              }}
              variant="outline"
              className="flex-1 bg-transparent hover:bg-white/10 text-white border-white/30 rounded-2xl"
            >
              <ArrowUpFromLine className="w-4 h-4 mr-2" />
              Retirer
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Liste des SFDs */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Mes SFDs</h2>
          <Badge variant="outline" className="text-xs">
            {sfdData.length} {sfdData.length > 1 ? 'comptes' : 'compte'}
          </Badge>
        </div>
        
        {sfdData && sfdData.length > 0 ? (
          <div className="space-y-3">
            {sfdData.map((sfd, index) => {
              const isActive = sfd.id === activeSfdId;
              
              return (
                <motion.div
                  key={sfd.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SfdAccountItem
                    sfd={{
                      id: sfd.id,
                      name: sfd.name,
                      code: sfd.code,
                      region: sfd.region || '',
                      logo_url: sfd.logo_url,
                      balance: 0,
                      currency: 'FCFA',
                      status: sfd.status || 'active',
                      isVerified: true,
                      isActive: isActive,
                      is_default: false
                    }}
                    status={isActive ? 'active' : 'inactive'}
                    isActive={isActive}
                    onSwitchSfd={handleSwitchSfd}
                    isProcessing={false}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-6">
              Vous n'êtes pas encore associé à un SFD
            </p>
            <Button
              onClick={() => navigate('/mobile-flow/adhesion')}
              className="bg-[#176455] hover:bg-[#1a7a65]"
            >
              Rejoindre un SFD
            </Button>
          </div>
        )}
      </div>

      {/* Funds Action Sheet */}
      <FundsActionSheet
        isOpen={showFundsSheet}
        onClose={() => setShowFundsSheet(false)}
        actionType={fundsActionType}
        onMobileMoneySelected={() => {
          setShowFundsSheet(false);
          setShowMobileMoneyModal(true);
        }}
        onCashierScanSelected={() => {
          setShowFundsSheet(false);
          setShowQRScanner(true);
        }}
      />

      {/* Mobile Money Modal */}
      <Dialog open={showMobileMoneyModal} onOpenChange={setShowMobileMoneyModal}>
        <MobileMoneyModal
          onClose={() => setShowMobileMoneyModal(false)}
          isWithdrawal={fundsActionType === 'withdrawal'}
        />
      </Dialog>

      {/* QR Scanner */}
      <CashierQRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        transactionType={fundsActionType}
      />

    </div>
  );
};

export default AccountsPage;
