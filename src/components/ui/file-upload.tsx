
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { X, Upload } from 'lucide-react';

interface FileUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept,
  disabled = false,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...value];
      let errorMessage = null;

      acceptedFiles.forEach((file) => {
        // Check max file size
        if (file.size > maxSize) {
          errorMessage = `Le fichier "${file.name}" dépasse la taille maximale autorisée.`;
          return;
        }

        // Check max files
        if (newFiles.length >= maxFiles) {
          errorMessage = `Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers.`;
          return;
        }

        // Add file if everything is ok
        newFiles.push(file);
      });

      setError(errorMessage);
      onChange(newFiles.slice(0, maxFiles));
    },
    [value, onChange, maxFiles, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez des fichiers ici'}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          ou cliquez pour sélectionner des fichiers
        </p>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          Parcourir
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-50 rounded flex items-center justify-center mr-2">
                  <span className="text-xs text-blue-600">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
