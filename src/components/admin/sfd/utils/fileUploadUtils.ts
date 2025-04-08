
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
      const logoData = await apiClient.uploadFile("logos", logoPath, logoFile);
      
      if (logoData) {
        // Get public URL for the uploaded file
        updatedData.logo_url = apiClient.getFileUrl("logos", logoPath);
      } else {
        throw new Error("Échec du téléchargement du logo");
      }
    }
    
    // Upload legal document if present
    if (documentFile) {
      const docPath = `sfds/documents/${formData.code}-${Date.now()}`;
      const docData = await apiClient.uploadFile("documents", docPath, documentFile);
      
      if (docData) {
        // Get public URL for the uploaded file
        updatedData.legal_document_url = apiClient.getFileUrl("documents", docPath);
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
