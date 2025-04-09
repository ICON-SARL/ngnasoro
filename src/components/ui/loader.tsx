
import React from 'react';
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]',
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-solid border-t-transparent border-primary",
        sizeClass[size],
        className
      )} 
    />
  );
};
