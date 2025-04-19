
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  onMenuToggle,
  showBackButton,
  onBackClick
}) => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick}
            className="mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </Button>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center">
        {user && onMenuToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
