
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AdminErrorMessageProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function AdminErrorMessage({ 
  title, 
  description, 
  actionText, 
  onAction 
}: AdminErrorMessageProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
        
        {actionText && onAction && (
          <div className="flex justify-end">
            <Button onClick={onAction}>
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
