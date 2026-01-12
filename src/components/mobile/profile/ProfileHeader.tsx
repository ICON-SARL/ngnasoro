import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Copy, Check, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const ProfileHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trigger } = useHapticFeedback();
  const [profileData, setProfileData] = useState<any>(null);
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
        
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('kyc_level, client_code')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!clientError && clientData) {
          setProfileData((prev: any) => ({
            ...prev,
            kyc_level: clientData.kyc_level,
            client_code: clientData.client_code
          }));
        }
      }
    };
    
    fetchProfileData();
  }, [user?.id]);
  
  const userName = user?.user_metadata?.full_name || user?.full_name || profileData?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const phoneNumber = profileData?.phone || user?.phone || user?.user_metadata?.phone || 'Non renseigné';
  const kycLevel = profileData?.kyc_level || 1;
  const clientCode = profileData?.client_code;

  const getKycLabel = (level: number) => {
    switch (level) {
      case 3: return 'Vérifié Premium';
      case 2: return 'Vérifié';
      default: return 'Basique';
    }
  };

  const handleCopyCode = async () => {
    if (clientCode) {
      await navigator.clipboard.writeText(clientCode);
      setCopied(true);
      trigger('light');
      
      toast({
        title: "✓ Copié",
        description: "Code client copié",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-primary to-primary/85 text-white px-5 pt-6 pb-8 safe-area-top">
      {/* Avatar + Infos principales */}
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Avatar className="h-18 w-18 border-2 border-white/25 shadow-lg">
            <AvatarImage src={user?.user_metadata?.avatar_url || user?.avatar_url} alt={userName} />
            <AvatarFallback className="bg-white/15 text-white text-xl font-semibold">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <h2 className="text-xl font-semibold truncate">{userName}</h2>
          <p className="text-sm text-white/75 mt-0.5">{phoneNumber}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-xs text-white/85">Compte vérifié</span>
          </div>
        </motion.div>
      </div>

      {/* Code Client + KYC */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 flex items-center justify-between"
      >
        {/* Code Client */}
        {clientCode && (
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
          >
            <code className="text-xs font-mono tracking-wide">{clientCode}</code>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-white/60" />
            )}
          </button>
        )}
        
        {/* Badge KYC + Upgrade */}
        <button
          onClick={() => {
            if (kycLevel < 3) {
              trigger('light');
              navigate('/mobile-flow/kyc-upgrade');
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
        >
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">{getKycLabel(kycLevel)}</span>
          {kycLevel < 3 && (
            <ChevronRight className="h-3.5 w-3.5 text-white/60" />
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default ProfileHeader;
