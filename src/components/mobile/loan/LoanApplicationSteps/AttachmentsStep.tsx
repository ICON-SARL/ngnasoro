
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';

interface AttachmentsStepProps {
  attachments: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (index: number) => void;
  isSubmitting: boolean;
}

const AttachmentsStep: React.FC<AttachmentsStepProps> = ({ 
  attachments, 
  handleFileChange, 
  removeAttachment,
  isSubmitting 
}) => {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold mb-2">Pièces justificatives</div>
      
      <div className="border-2 border-dashed rounded-lg p-4 text-center">
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500 mb-2">Glissez-déposez ou cliquez pour ajouter</p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Parcourir
        </Button>
      </div>
      
      {attachments.length > 0 && (
        <div className="border rounded-lg divide-y">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3">
              <div className="flex items-center">
                <div className="bg-gray-100 p-1.5 rounded">
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeAttachment(index)}
                className="text-red-500 hover:text-red-700"
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Important</p>
          <p>Toutes les pièces justificatives doivent être lisibles et valides. Des documents incomplets peuvent retarder le traitement de votre demande.</p>
        </div>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Traitement en cours...' : 'Soumettre ma demande'}
        </Button>
      </div>
    </div>
  );
};

export default AttachmentsStep;
