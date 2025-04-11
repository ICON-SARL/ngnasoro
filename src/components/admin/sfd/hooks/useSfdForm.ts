import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { sfdFormSchema, SfdFormValues } from '../schemas/sfdFormSchema';
import { uploadSfdFiles } from '../utils/fileUploadUtils';
import { Sfd } from '../../types/sfd-types';

interface UseSfdFormProps {
  initialData?: Partial<Sfd>;
  onSubmit: (data: SfdFormValues) => void;
}

export function useSfdForm({ initialData, onSubmit }: UseSfdFormProps) {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // We handle subsidy_balance as a calculated field,
  // but keep it in the form for UI display purposes
  const form = useForm<SfdFormValues>({
    resolver: zodResolver(sfdFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      region: initialData?.region || '',
      description: initialData?.description || '',
      contact_email: initialData?.contact_email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      status: (initialData?.status as 'active' | 'pending' | 'suspended') || 'active',
      logo_url: initialData?.logo_url || '',
      legal_document_url: initialData?.legal_document_url || '',
      subsidy_balance: initialData?.subsidy_balance || 0,
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocumentFile(file);
  };

  const handleFormSubmit = async (values: SfdFormValues) => {
    if (logoFile || documentFile) {
      const dataWithUploads = await uploadSfdFiles(
        values, 
        logoFile, 
        documentFile, 
        setIsUploading, 
        (message) => toast({
          title: "Erreur",
          description: message,
          variant: "destructive"
        })
      );
      
      if (dataWithUploads) {
        onSubmit(dataWithUploads);
      }
    } else {
      onSubmit(values);
    }
  };

  return {
    form,
    logoFile,
    documentFile,
    isUploading,
    handleLogoChange,
    handleDocumentChange,
    handleFormSubmit,
  };
}
