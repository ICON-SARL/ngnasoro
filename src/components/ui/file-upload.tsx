
import React, { useRef, useState } from 'react';
import { Button } from './button';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onChange,
  accept,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onChange(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {!file ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
            ref={inputRef}
          />
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            Choisir un fichier
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 border rounded-lg">
          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
