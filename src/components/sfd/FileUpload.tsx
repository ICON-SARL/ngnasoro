
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  label?: string;
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = '.jpg,.jpeg,.png,.pdf',
  label = 'Téléverser un fichier',
  maxSize = 5, // Default to 5MB
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille du fichier doit être inférieure à ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }
    
    // Check file type if accept is specified
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',');
      const fileType = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.includes(fileType)) {
        toast({
          title: "Type de fichier non supporté",
          description: `Types de fichiers acceptés : ${accept}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setSelectedFile(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      await onUpload(selectedFile);
      // Reset after successful upload
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur de téléversement",
        description: "Une erreur est survenue lors du téléversement du fichier",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image';
      default:
        return 'Fichier';
    }
  };
  
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      <input
        type="file"
        accept={accept}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-gray-500">
              Glisser-déposer ou cliquer pour sélectionner
              {maxSize && <span> (Max: {maxSize}MB)</span>}
            </p>
            {accept && accept !== '*' && (
              <p className="text-xs text-gray-400">
                Formats acceptés : {accept.replace(/\./g, '')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {getFileType(selectedFile.name)} • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelectedFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => handleUpload()} disabled={loading}>
                {loading ? "Envoi..." : "Téléverser"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
