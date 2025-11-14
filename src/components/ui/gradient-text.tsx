import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  animated = false,
}) => {
  return (
    <span
      className={cn(
        'gradient-text font-bold',
        animated && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
};
