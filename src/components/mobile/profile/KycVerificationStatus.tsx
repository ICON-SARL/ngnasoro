
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Shield } from 'lucide-react';
import { KycVerificationDocument, VerificationStatus } from '@/types/kyc';

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
        // Build the base query
        let query = supabase
          .from('verification_documents')
          .select('*');
        
        // Add the appropriate filter condition
        if (clientCode) {
          query = query.eq('client_code', clientCode);
        } else if (user?.id) {
          query = query.eq('user_id', user.id);
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Check if any document is verified
        const hasVerifiedDocument = Array.isArray(data) && 
          data.some(doc => doc.verification_status === 'verified');
        
        setIsVerified(hasVerifiedDocument || false);
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
