
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const ProfileHeader = () => {
  const { user } = useAuth();
  
  // Extract user name from metadata if available, or fall back to email
  const userName = user?.user_metadata?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  
  // Simulate KYC status for now
  const isKycVerified = true;
  const phoneNumber = user?.phone || user?.user_metadata?.phone || '+223 76 45 32 10';
  
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
      
      {isKycVerified && (
        <Badge className="bg-green-500/90 hover:bg-green-500 flex items-center gap-1 px-2 py-1">
          <Shield className="h-3 w-3" />
          <Check className="h-3 w-3" />
          KYC Vérifié
        </Badge>
      )}
    </div>
  );
};

export default ProfileHeader;
