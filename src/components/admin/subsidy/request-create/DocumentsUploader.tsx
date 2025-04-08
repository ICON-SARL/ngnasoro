
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

export function DocumentsUploader() {
  const [files, setFiles] = useState<File[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documents">Documents justificatifs</Label>
        
        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <input
            id="documents"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          
          <label htmlFor="documents" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Glissez-déposez vos fichiers ici ou cliquez pour télécharger
              </p>
              <p className="text-xs text-muted-foreground">
                (PDF, DOCX, XLS, JPG, PNG, max 5MB)
              </p>
            </div>
          </label>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Fichiers sélectionnés</Label>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50 border">
                <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 p-1 h-auto"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
