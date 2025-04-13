
import React, { useState } from 'react';
import { FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, X } from 'lucide-react';
import Image from 'next/image';

interface SfdLogoUploaderProps {
  logoFile: File | null;
  logoUrl: string | null;
  onLogoChange: (file: File | null) => void;
}

export function SfdLogoUploader({
  logoFile,
  logoUrl,
  onLogoChange
}: SfdLogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onLogoChange(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearLogo = () => {
    onLogoChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <FormLabel>Logo de la SFD</FormLabel>
      <div className="border border-dashed rounded-lg bg-gray-50 overflow-hidden">
        {previewUrl || logoFile ? (
          <div className="p-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={previewUrl || (logoFile ? URL.createObjectURL(logoFile) : '')} 
                  alt="Logo preview" 
                  className="object-contain w-full h-full"
                />
                <button 
                  onClick={clearLogo}
                  type="button"
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {logoFile?.name}
                {logoFile && <span className="ml-2 text-xs">({(logoFile.size / 1024).toFixed(1)} KB)</span>}
              </div>
              <label htmlFor="logo" className="cursor-pointer text-blue-600 text-sm font-medium hover:underline">
                Changer le logo
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
            <span className="font-medium text-sm">Cliquez pour uploader le logo</span>
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
  );
}
