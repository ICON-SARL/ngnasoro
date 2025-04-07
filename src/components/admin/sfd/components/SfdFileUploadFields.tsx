
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { UploadCloud } from 'lucide-react';

interface SfdFileUploadFieldsProps {
  logoFile: File | null;
  documentFile: File | null;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SfdFileUploadFields({
  logoFile,
  documentFile,
  handleLogoChange,
  handleDocumentChange
}: SfdFileUploadFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <FormLabel>Logo (optionnel)</FormLabel>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Cliquez pour uploader</span>
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 2MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleLogoChange}
            />
          </label>
        </div>
        {logoFile && (
          <p className="text-sm text-blue-600">{logoFile.name}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <FormLabel>Document légal (optionnel)</FormLabel>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Cliquez pour uploader</span>
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleDocumentChange}
            />
          </label>
        </div>
        {documentFile && (
          <p className="text-sm text-blue-600">{documentFile.name}</p>
        )}
      </div>
    </div>
  );
}
