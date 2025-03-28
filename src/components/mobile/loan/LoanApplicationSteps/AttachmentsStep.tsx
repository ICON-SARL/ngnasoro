
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface AttachmentsStepProps {
  attachments: string[];
  setAttachments: (attachments: string[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const AttachmentsStep: React.FC<AttachmentsStepProps> = ({
  attachments,
  setAttachments,
  onBack,
  onSubmit,
  isSubmitting
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Simulate file upload
    // In a real app, this would upload to storage
    toast({
      title: "Fichier ajouté",
      description: `${selectedFile.name} a été ajouté à votre demande`
    });
    
    // Add file URL (mocked)
    setAttachments([...attachments, `file://${selectedFile.name}`]);
    setSelectedFile(null);
    
    // Reset the file input
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">Documents Justificatifs</h2>
      
      <div className="space-y-2">
        <Label htmlFor="document-upload">Pièce d'identité</Label>
        <div className="border-2 border-dashed rounded-md p-4 text-center">
          <input
            id="document-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Label htmlFor="document-upload" className="cursor-pointer text-sm block p-2">
            {selectedFile ? selectedFile.name : "Cliquez ici pour sélectionner un fichier"}
          </Label>
          
          {selectedFile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpload}
              className="mt-2"
            >
              Ajouter ce fichier
            </Button>
          )}
        </div>
      </div>
      
      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium">Documents ajoutés:</h3>
          <ul className="space-y-1">
            {attachments.map((file, index) => (
              <li key={index} className="text-sm flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{file.split('/').pop()}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                >
                  Supprimer
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex space-x-2 mt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Button 
          className="flex-1" 
          onClick={onSubmit}
          disabled={isSubmitting || attachments.length === 0}
        >
          {isSubmitting ? "Soumission en cours..." : "Soumettre la demande"}
        </Button>
      </div>
    </div>
  );
};

export default AttachmentsStep;
