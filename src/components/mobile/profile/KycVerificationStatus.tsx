
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Shield } from 'lucide-react';
import { KycVerificationDocument } from '@/types/kyc';

interface KycVerificationStatusProps {
  className?: string;
  clientCode?: string;
}

const KycVerificationStatus: React.FC<KycVerificationStatusProps> = ({ className, clientCode }) => {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user?.id && !clientCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const filterCondition = clientCode 
          ? { client_code: clientCode }
          : { user_id: user?.id };

        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .match(filterCondition);
        
        if (error) throw error;
        
        // Client documents don't have verification_status, they are just uploaded
        // Consider a document verified if it exists
        const hasVerifiedDocument = Array.isArray(data) && data.length > 0;
        
        setIsVerified(hasVerifiedDocument);
      } catch (error) {
        console.error('Error checking KYC verification status:', error);
        setError('Unable to check verification status');
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkVerificationStatus();
  }, [user?.id, clientCode]);

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <Badge variant="outline" className="bg-gray-50 text-gray-500">
          <Shield className="h-3 w-3 mr-1" />
          Chargement...
        </Badge>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center ${className}`}>
        <Badge variant="destructive" className="border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Erreur
        </Badge>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className={`flex items-center ${className}`}>
        <Badge className="bg-green-50 text-green-600 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          <Check className="h-3 w-3 mr-1" />
          KYC Vérifié
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Badge 
        variant="outline" 
        className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
      >
        <Shield className="h-3 w-3 mr-1" />
        Non vérifié
      </Badge>
    </div>
  );
};

export default KycVerificationStatus;
