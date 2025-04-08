
import { SfdFormValues } from '../schemas/sfdFormSchema';
import { storageApi } from '@/utils/api/modules/storageApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Uploads SFD files to storage and updates the form data with URLs
 */
export const uploadSfdFiles = async (
  formData: SfdFormValues,
  logoFile: File | null,
  documentFile: File | null,
  setIsUploading: (loading: boolean) => void,
  showError: (message: string) => void
): Promise<SfdFormValues | null> => {
  try {
    setIsUploading(true);
    let updatedData = { ...formData };

    // Upload logo if provided
    if (logoFile) {
      const filePath = `sfd-logos/${Date.now()}-${logoFile.name}`;
      
      const uploadResult = await storageApi.uploadFile('sfd-assets', filePath, logoFile);
      
      if (!uploadResult) {
        throw new Error('Erreur lors du chargement du logo');
      }
      
      updatedData.logo_url = storageApi.getFileUrl('sfd-assets', filePath);
    }

    // Upload legal document if provided
    if (documentFile) {
      const filePath = `sfd-docs/${Date.now()}-${documentFile.name}`;
      
      const uploadResult = await storageApi.uploadFile('sfd-assets', filePath, documentFile);
      
      if (!uploadResult) {
        throw new Error('Erreur lors du chargement du document légal');
      }
      
      updatedData.legal_document_url = storageApi.getFileUrl('sfd-assets', filePath);
    }

    return updatedData;
  } catch (error) {
    console.error('Erreur lors du chargement des fichiers:', error);
    showError(error instanceof Error ? error.message : 'Erreur lors du chargement des fichiers');
    return null;
  } finally {
    setIsUploading(false);
  }
};
