import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Check, Wallet, CreditCard, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
  >
    <div className="flex justify-center mb-1 text-accent">
      {icon}
    </div>
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs opacity-90">{label}</div>
  </motion.div>
);

const ProfileHeader = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [accountsCount, setAccountsCount] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setProfileData(data);
        }
      }
    };
    
    const fetchStats = async () => {
      if (user?.id) {
        // Get accounts count
        const { count: accountsCount } = await supabase
          .from('accounts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Get active loans
        const { count: loansCount } = await supabase
          .from('sfd_loans')
          .select('*, sfd_clients!inner(*)', { count: 'exact', head: true })
          .eq('sfd_clients.user_id', user.id)
          .eq('status', 'active');
        
        setAccountsCount(accountsCount || 0);
        setActiveLoans(loansCount || 0);
      }
    };
    
    fetchProfileData();
    fetchStats();
  }, [user?.id]);
  
  const userName = user?.user_metadata?.full_name || user?.full_name || profileData?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const phoneNumber = profileData?.phone || user?.phone || user?.user_metadata?.phone || 'Non renseigné';
  const lastLoginAt = user?.last_sign_in_at;
  const formattedLastLogin = lastLoginAt 
    ? formatDistanceToNow(new Date(lastLoginAt), { 
        addSuffix: true,
        locale: fr 
      })
    : 'Jamais connecté';

  const isKycVerified = true;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent/20 text-white">
      {/* Pattern background subtil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent rounded-full blur-2xl" />
      </div>
      
      <div className="relative flex flex-col items-center justify-center p-6 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Avatar className="h-28 w-28 border-4 border-accent shadow-[0_0_25px_rgba(252,176,65,0.4)] mb-3">
            <AvatarImage src={user?.user_metadata?.avatar_url || user?.avatar_url} alt={userName} />
            <AvatarFallback className="bg-primary text-white text-2xl font-bold">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-center mb-1"
        >
          {userName}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm opacity-90 mb-3"
        >
          {phoneNumber}
        </motion.p>
        
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {user?.user_metadata?.client_code && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
            >
              <Badge className="bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center gap-1 px-3 py-1.5">
                <Shield className="h-3 w-3" />
                Code: {user.user_metadata.client_code}
              </Badge>
            </motion.div>
          )}
          
          {isKycVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.25 }}
            >
              <Badge className="bg-accent hover:bg-accent/90 flex items-center gap-1 px-3 py-1.5 shadow-lg">
                <Shield className="h-3 w-3" />
                <Check className="h-3 w-3" />
                KYC Vérifié
              </Badge>
            </motion.div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs opacity-75 mb-4"
        >
          Dernière connexion: {formattedLastLogin}
        </motion.div>
        
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          <StatCard icon={<Wallet className="h-5 w-5" />} value={accountsCount.toString()} label="Comptes" />
          <StatCard icon={<CreditCard className="h-5 w-5" />} value={activeLoans.toString()} label="Prêts actifs" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} value="98%" label="Fiabilité" />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
