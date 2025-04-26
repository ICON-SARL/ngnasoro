
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Clock, Shield } from 'lucide-react';

interface KycVerificationStatusProps {
  className?: string;
  clientCode?: string;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface KycVerificationDocument {
  id: string;
  adhesion_request_id: string;
  document_type: string;
  document_url: string;
  verification_status: string;
  created_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  verification_notes?: string | null;
  client_code?: string | null;
}

const KycVerificationStatus: React.FC<KycVerificationStatusProps> = ({ className, clientCode }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KycVerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id && !clientCode) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from('verification_documents')
          .select('*');
        
        if (clientCode) {
          query = query.eq('client_code', clientCode);
        } else if (user?.id) {
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Break the type recursion by explicitly casting as an array of KycVerificationDocument
        const documentsArray: KycVerificationDocument[] = data || [];
        setDocuments(documentsArray);
      } catch (error) {
        console.error('Error fetching KYC documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user?.id, clientCode]);
  
  const getOverallStatus = (): 'loading' | 'none' | 'verified' | 'rejected' | 'pending' => {
    if (isLoading) return 'loading';
    if (documents.length === 0) return 'none';
    
    const requiredTypes = ['id_card_front', 'id_card_back', 'proof_of_address'];
    
    const documentByType: Record<string, KycVerificationDocument> = {};
    
    documents.forEach(doc => {
      documentByType[doc.document_type] = doc;
    });
    
    const allVerified = requiredTypes.every(
      type => documentByType[type]?.verification_status === 'verified'
    );
    
    if (allVerified) return 'verified';
    
    if (documents.some(doc => doc.verification_status === 'rejected')) {
      return 'rejected';
    }
    
    return 'pending';
  };
  
  const status = getOverallStatus();
  
  if (isLoading) {
    return <div className={`flex items-center ${className}`}>
      <Clock className="h-4 w-4 animate-spin mr-1" />
      <span>Chargement...</span>
    </div>;
  }
  
  if (status === 'none') {
    return <div className={`flex items-center ${className}`}>
      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
        <Shield className="h-3 w-3 mr-1" />
        Non vérifié
      </Badge>
    </div>;
  }
  
  if (status === 'verified') {
    return <div className={`flex items-center ${className}`}>
      <Badge className="bg-green-50 text-green-600 border-green-200">
        <Shield className="h-3 w-3 mr-1" />
        <Check className="h-3 w-3 mr-1" />
        Vérifié
      </Badge>
    </div>;
  }
  
  if (status === 'rejected') {
    return <div className={`flex items-center ${className}`}>
      <Badge variant="destructive">
        <X className="h-3 w-3 mr-1" />
        Rejeté
      </Badge>
    </div>;
  }
  
  return <div className={`flex items-center ${className}`}>
    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
      <Clock className="h-3 w-3 mr-1" />
      En cours de vérification
    </Badge>
  </div>;
};

export default KycVerificationStatus;
