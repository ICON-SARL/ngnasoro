
import { SfdFormValues } from "../schemas/sfdFormSchema";
import { storageApi } from "@/utils/api/modules/storageApi";

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
      // Ensure the logos bucket exists
      await storageApi.createBucketIfNotExists('logos', true);
      
      const logoPath = `sfds/logos/${formData.code}-${Date.now()}`;
      try {
        const uploadResult = await storageApi.uploadFile("logos", logoPath, logoFile);
        updatedData.logo_url = uploadResult.url;
      } catch (error) {
        console.error("Logo upload error:", error);
        throw new Error("Échec du téléchargement du logo");
      }
    }
    
    // Upload legal document if present
    if (documentFile) {
      // Ensure the documents bucket exists
      await storageApi.createBucketIfNotExists('documents', false);
      
      const docPath = `sfds/documents/${formData.code}-${Date.now()}`;
      try {
        const uploadResult = await storageApi.uploadFile("documents", docPath, documentFile);
        updatedData.legal_document_url = uploadResult.url;
      } catch (error) {
        console.error("Document upload error:", error);
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
