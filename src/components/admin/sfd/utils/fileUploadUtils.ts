
import { supabase } from '@/integrations/supabase/client';
import { SfdFormValues } from '../schemas/sfdFormSchema';

export async function uploadSfdFiles(
  formData: SfdFormValues,
  logoFile: File | null,
  documentFile: File | null,
  setIsUploading: (isUploading: boolean) => void,
  onError: (message: string) => void
) {
  setIsUploading(true);
  const updatedFormData = { ...formData };

  try {
    if (logoFile) {
      const logoFileName = `${Date.now()}-${logoFile.name}`;
      const { error: logoError } = await supabase.storage
        .from('sfd-logos')
        .upload(logoFileName, logoFile);

      if (logoError) throw new Error(`Erreur lors de l'upload du logo: ${logoError.message}`);

      const { data: logoUrlData } = supabase.storage
        .from('sfd-logos')
        .getPublicUrl(logoFileName);

      updatedFormData.logo_url = logoUrlData.publicUrl;
    }

    if (documentFile) {
      const docFileName = `${Date.now()}-${documentFile.name}`;
      const { error: docError } = await supabase.storage
        .from('sfd-documents')
        .upload(docFileName, documentFile);

      if (docError) throw new Error(`Erreur lors de l'upload du document: ${docError.message}`);

      const { data: docUrlData } = supabase.storage
        .from('sfd-documents')
        .getPublicUrl(docFileName);

      updatedFormData.legal_document_url = docUrlData.publicUrl;
    }

    setIsUploading(false);
    return updatedFormData;
  } catch (error: any) {
    setIsUploading(false);
    onError(error.message || "Une erreur est survenue pendant l'upload des fichiers");
    return null;
  }
}
