
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ImageIcon, FileIcon, UploadIcon } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <FormLabel htmlFor="logo">Logo (optionnel)</FormLabel>
        <div className="border border-dashed rounded-lg bg-gray-50 overflow-hidden">
          {logoFile ? (
            <div className="p-4">
              <div className="flex items-center space-x-2 text-sm">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <span className="flex-1 truncate">{logoFile.name}</span>
                <span className="text-gray-500">
                  {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="mt-3 flex justify-center">
                <label htmlFor="logo" className="cursor-pointer text-blue-600 text-sm font-medium hover:underline">
                  Changer le fichier
                </label>
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          ) : (
            <label
              htmlFor="logo"
              className="flex flex-col items-center justify-center p-6 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 mb-2">
                <UploadIcon className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
              </div>
              <span className="font-medium text-sm">Cliquez pour uploader</span>
              <span className="text-gray-500 text-xs mt-1">SVG, PNG, JPG (MAX. 2MB)</span>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel htmlFor="document">Document légal (optionnel)</FormLabel>
        <div className="border border-dashed rounded-lg bg-gray-50 overflow-hidden">
          {documentFile ? (
            <div className="p-4">
              <div className="flex items-center space-x-2 text-sm">
                <FileIcon className="h-5 w-5 text-red-500" />
                <span className="flex-1 truncate">{documentFile.name}</span>
                <span className="text-gray-500">
                  {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="mt-3 flex justify-center">
                <label htmlFor="document" className="cursor-pointer text-blue-600 text-sm font-medium hover:underline">
                  Changer le fichier
                </label>
                <input
                  id="document"
                  name="document"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleDocumentChange}
                />
              </div>
            </div>
          ) : (
            <label
              htmlFor="document"
              className="flex flex-col items-center justify-center p-6 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-50 mb-2">
                <UploadIcon className="h-5 w-5 text-gray-500 group-hover:text-red-500" />
              </div>
              <span className="font-medium text-sm">Cliquez pour uploader</span>
              <span className="text-gray-500 text-xs mt-1">PDF (MAX. 10MB)</span>
              <input
                id="document"
                name="document"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleDocumentChange}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
