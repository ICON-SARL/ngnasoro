
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Loader: React.FC<LoaderProps> = ({ className, size = 'md' }) => {
  const sizeClass = {
    'xs': 'h-3 w-3',
    'sm': 'h-4 w-4',
    'md': 'h-6 w-6',
    'lg': 'h-8 w-8',
    'xl': 'h-12 w-12'
  }[size];
  
  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClass, className)}
    />
  );
};
