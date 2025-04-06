
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Menu } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "MEREF-SFD",
  showBackButton = false,
  showMenu = true,
  onMenuClick
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-[#0D6A51] text-white sticky top-0 z-30">
      <div className="container py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBackButton ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 text-white hover:bg-[#0D6A51]/20"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : null}
            
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-white text-[#0D6A51] flex items-center justify-center font-medium text-sm">
                  M
                </div>
                <span className="font-medium">{title}</span>
              </Link>
            </div>
          </div>
          
          {showMenu && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-[#0D6A51]/20"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
