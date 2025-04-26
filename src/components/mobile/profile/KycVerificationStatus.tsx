
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Shield } from 'lucide-react';

interface KycVerificationStatusProps {
  className?: string;
  clientCode?: string;
}

const KycVerificationStatus: React.FC<KycVerificationStatusProps> = ({ className, clientCode }) => {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user?.id && !clientCode) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from('verification_documents')
          .select('*');
        
        if (clientCode) {
          query = query.eq('client_code', clientCode);
        } else if (user?.id) {
          // Add user_id condition when we have a user
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Check if all required documents are verified
        const hasAllVerifiedDocuments = data?.some(doc => doc.verification_status === 'verified');
        setIsVerified(hasAllVerifiedDocuments || false);
      } catch (error) {
        console.error('Error checking KYC verification status:', error);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkVerificationStatus();
  }, [user?.id, clientCode]);

  if (isLoading) {
    return <div className={`flex items-center ${className}`}>
      <Badge variant="outline" className="bg-gray-50 text-gray-500">
        <Shield className="h-3 w-3 mr-1" />
        Chargement...
      </Badge>
    </div>;
  }

  if (isVerified) {
    return <div className={`flex items-center ${className}`}>
      <Badge className="bg-green-50 text-green-600 border-green-200">
        <Shield className="h-3 w-3 mr-1" />
        <Check className="h-3 w-3 mr-1" />
        KYC Vérifié
      </Badge>
    </div>;
  }

  return <div className={`flex items-center ${className}`}>
    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
      <Shield className="h-3 w-3 mr-1" />
      Non vérifié
    </Badge>
  </div>;
};

export default KycVerificationStatus;
