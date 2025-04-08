
import { SfdFormValues } from "../schemas/sfdFormSchema";
import { apiClient } from "@/utils/apiClient";

/**
 * Upload SFD logo and legal document files and return the updated form data
 */
export async function uploadSfdFiles(
  formData: SfdFormValues,
  logoFile: File | null,
  documentFile: File | null,
  setIsUploading: (isUploading: boolean) => void,
  showError: (message: string) => void
): Promise<SfdFormValues | null> {
  // If no files to upload, just return the original data
  if (!logoFile && !documentFile) {
    return formData;
  }

  setIsUploading(true);
  
  try {
    const updatedData = { ...formData };

    // Upload logo if present
    if (logoFile) {
      const logoPath = `sfds/logos/${formData.code}-${Date.now()}`;
      const logoUrl = await apiClient.uploadFile(logoFile, logoPath);
      
      if (logoUrl) {
        updatedData.logo_url = logoUrl;
      } else {
        throw new Error("Échec du téléchargement du logo");
      }
    }
    
    // Upload legal document if present
    if (documentFile) {
      const docPath = `sfds/documents/${formData.code}-${Date.now()}`;
      const docUrl = await apiClient.uploadFile(documentFile, docPath);
      
      if (docUrl) {
        updatedData.legal_document_url = docUrl;
      } else {
        throw new Error("Échec du téléchargement du document légal");
      }
    }

    return updatedData;
  } catch (error: any) {
    showError(`Erreur lors du téléchargement des fichiers: ${error.message}`);
    return null;
  } finally {
    setIsUploading(false);
  }
}
