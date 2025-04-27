import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

const ProfileHeader = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  
  // Fetch profile data from the profiles table
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
    
    fetchProfileData();
  }, [user?.id]);
  
  // Extract user info from metadata and profiles
  const userName = user?.user_metadata?.full_name || user?.full_name || profileData?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  
  // Get phone number from profile data first, then fall back to user metadata
  const phoneNumber = profileData?.phone || user?.phone || user?.user_metadata?.phone || 'Non renseigné';
  
  // Get last login time and format it
  const lastLoginAt = user?.last_sign_in_at;
  const formattedLastLogin = lastLoginAt 
    ? formatDistanceToNow(new Date(lastLoginAt), { 
        addSuffix: true,
        locale: fr 
      })
    : 'Jamais connecté';

  const isKycVerified = true;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#0D6A51]/80 to-[#0D6A51]/20 text-white">
      <Avatar className="h-24 w-24 border-4 border-white mb-3">
        <AvatarImage src={user?.user_metadata?.avatar_url || user?.avatar_url} alt={userName} />
        <AvatarFallback className="bg-[#0D6A51] text-white text-xl">
          {userName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <h2 className="text-xl font-bold text-center">{userName}</h2>
      <p className="text-sm opacity-90 mb-2">{phoneNumber}</p>
      
      {user?.user_metadata?.client_code && (
        <Badge className="bg-blue-500/90 hover:bg-blue-500 flex items-center gap-1 px-2 py-1 mb-2">
          <Shield className="h-3 w-3" />
          Code: {user.user_metadata.client_code}
        </Badge>
      )}
      
      <div className="flex flex-col items-center gap-2">
        {isKycVerified && (
          <Badge className="bg-green-500/90 hover:bg-green-500 flex items-center gap-1 px-2 py-1">
            <Shield className="h-3 w-3" />
            <Check className="h-3 w-3" />
            KYC Vérifié
          </Badge>
        )}
        
        <div className="text-sm opacity-75 flex items-center gap-1">
          Dernière connexion: {formattedLastLogin}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
