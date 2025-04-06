
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useSubsidyForm(onSuccess: () => void) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    sfd_id: '',
    amount: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    region: 'all', // Initialize with 'all' instead of empty string
    purpose: '',
    justification: '',
    expected_impact: ''
  });
  
  // Mock data for available SFDs
  const availableSfds = [
    { id: 'sfd1', name: 'RCPB Ouagadougou', region: 'Ouagadougou' },
    { id: 'sfd2', name: 'Microcred Abidjan', region: 'Abidjan' },
    { id: 'sfd3', name: 'FUCEC Lomé', region: 'Lomé' },
    { id: 'sfd4', name: 'ACEP Dakar', region: 'Dakar' }
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Here you would normally send the data to an API
    console.log('Submitting form data:', {
      ...formData,
      // Convert 'all' to appropriate value for backend if needed
      region: formData.region === 'all' ? null : formData.region
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Demande soumise",
        description: "Votre demande de prêt MEREF a été soumise avec succès.",
      });
      onSuccess();
    }, 1500);
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
