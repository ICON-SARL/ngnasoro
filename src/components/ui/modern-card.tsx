import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'neutral';
  icon?: LucideIcon;
  title?: string;
  className?: string;
  contentClassName?: string;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'neutral',
  icon: Icon,
  title,
  className,
  contentClassName,
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(23,100,85,0.15)]',
    accent: 'bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground shadow-[0_4px_20px_rgba(252,176,65,0.15)]',
    neutral: 'bg-card text-card-foreground border border-border shadow-sm',
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg',
        variantStyles[variant],
        className
      )}
    >
      {(Icon || title) && (
        <div className={cn(
          'p-4 pb-3 flex items-center gap-3',
          variant === 'neutral' && 'border-b border-border'
        )}>
          {Icon && (
            <div className={cn(
              'p-2 rounded-lg',
              variant === 'primary' && 'bg-white/20 backdrop-blur-sm',
              variant === 'accent' && 'bg-white/20 backdrop-blur-sm',
              variant === 'neutral' && 'bg-primary/10'
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          {title && (
            <h3 className="font-semibold text-lg">{title}</h3>
          )}
        </div>
      )}
      <div className={cn('p-4', contentClassName)}>
        {children}
      </div>
    </div>
  );
};
