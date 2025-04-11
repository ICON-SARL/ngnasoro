
import React from 'react';
import { cn } from '@/lib/utils';

interface ReportHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="mt-4 md:mt-0">{children}</div>
      )}
    </div>
  );
};
