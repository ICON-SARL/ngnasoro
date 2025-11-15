import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Wallet, TrendingUp, CheckCircle2, FileText, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

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
  const { toast } = useToast();
  const { trigger } = useHapticFeedback();
  const [profileData, setProfileData] = useState<any>(null);
  const [accountsCount, setAccountsCount] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [copied, setCopied] = useState(false);
  
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

  const kycLevel = profileData?.kyc_level || 1;
  
  const getKycInfo = (level: number) => {
    switch (level) {
      case 3:
        return {
          label: 'Niveau 3',
          description: 'Sans limite',
          progress: 100,
          bgColor: 'bg-gradient-to-br from-[#fcb041] to-[#fdc158]',
        };
      case 2:
        return {
          label: 'Niveau 2',
          description: 'Limite: 500K FCFA',
          progress: 66,
          bgColor: 'bg-gradient-to-br from-[#176455] to-[#1a7a65]',
        };
      default:
        return {
          label: 'Niveau 1',
          description: 'Limite: 50K FCFA',
          progress: 33,
          bgColor: 'bg-gray-400',
        };
    }
  };

  const kycInfo = getKycInfo(kycLevel);
  const clientCode = profileData?.client_code;

  const handleCopyCode = async () => {
    if (clientCode) {
      await navigator.clipboard.writeText(clientCode);
      setCopied(true);
      trigger('light');
      
      toast({
        title: "✓ Copié",
        description: "Code client copié dans le presse-papiers",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          className="relative mb-3"
        >
          <Avatar className="h-28 w-28 border-4 border-accent shadow-[0_0_25px_rgba(252,176,65,0.4)]">
            <AvatarImage src={user?.user_metadata?.avatar_url || user?.avatar_url} alt={userName} />
            <AvatarFallback className="bg-primary text-white text-2xl font-bold">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Badge KYC moderne */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
            className={`
              absolute -bottom-2 -right-2 w-12 h-12 rounded-full 
              flex items-center justify-center text-white font-bold
              border-4 border-primary shadow-lg
              ${kycInfo.bgColor}
              ${kycLevel < 3 ? 'animate-pulse' : ''}
            `}
          >
            <Shield className="h-6 w-6" />
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold mb-1">{userName}</h2>
          <p className="text-sm opacity-90 mb-2">{phoneNumber}</p>
          <div className="flex items-center justify-center gap-2 text-sm mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-300" />
            <span>Compte vérifié</span>
          </div>
          
          {/* Code Client avec bouton copier */}
          {clientCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
            >
              <FileText className="h-4 w-4 text-accent" />
              <code className="text-sm font-mono font-medium tracking-wide">
                {clientCode}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white hover:bg-white/20 rounded-lg"
                onClick={handleCopyCode}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Section KYC détaillée */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">{kycInfo.label}</span>
            </div>
            <span className="text-sm opacity-90">{kycInfo.description}</span>
          </div>
          
          <Progress value={kycInfo.progress} className="h-2 mb-3 bg-white/20" />
          
          {kycLevel < 3 && (
            <Button 
              size="sm" 
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
            >
              Augmenter mon niveau
            </Button>
          )}
        </motion.div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <StatCard 
            icon={<Wallet className="w-5 h-5" />} 
            value={accountsCount.toString()} 
            label="Comptes" 
          />
          <StatCard 
            icon={<TrendingUp className="w-5 h-5" />} 
            value={activeLoans.toString()} 
            label="Prêts actifs" 
          />
          <StatCard 
            icon={<Shield className="w-5 h-5" />} 
            value="98%" 
            label="Fiabilité" 
          />
        </div>

        <p className="text-xs opacity-70 mt-4">
          Dernière connexion: {formattedLastLogin}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
