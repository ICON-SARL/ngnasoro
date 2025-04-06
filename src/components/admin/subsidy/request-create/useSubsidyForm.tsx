
import { useState, useEffect } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SubsidyFormData, PriorityType, SfdOption } from './types';

export function useSubsidyForm(onSuccess?: () => void) {
  const { user } = useAuth();
  const { createSubsidyRequest } = useSubsidyRequests();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SubsidyFormData>({
    sfd_id: '',
    amount: '',
    purpose: '',
    justification: '',
    priority: 'normal' as PriorityType,
    region: '',
    expected_impact: '',
  });
  
  const [availableSfds, setAvailableSfds] = useState<SfdOption[]>([]);
  
  // Fetch available SFDs on component mount
  useEffect(() => {
    const fetchSfds = async () => {
      const { data } = await supabase
        .from('sfds')
        .select('id, name, region')
        .eq('status', 'active')
        .order('name');
      
      if (data) {
        setAvailableSfds(data);
        
        // If there's only one SFD, select it by default
        if (data.length === 1) {
          setFormData(prev => ({ ...prev, sfd_id: data[0].id }));
        }
      }
    };
    
    fetchSfds();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'priority') {
      setFormData(prev => ({ ...prev, [name]: value as PriorityType }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const requestData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      
      await createSubsidyRequest.mutateAsync(requestData);
      
      // Reset form
      setFormData({
        sfd_id: '',
        amount: '',
        purpose: '',
        justification: '',
        priority: 'normal' as PriorityType,
        region: '',
        expected_impact: '',
      });
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating subsidy request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    availableSfds,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  };
}
