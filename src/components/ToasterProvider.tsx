
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

export function ToasterProvider() {
  return (
    <Toaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
    />
  );
}
