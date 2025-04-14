
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMenuButtonProps {
  onClick: () => void;
}

const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button 
        size="icon" 
        className="h-10 w-10 rounded-full bg-[#0D6A51] shadow-lg"
        onClick={onClick}
      >
        <Menu className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
};

export default FloatingMenuButton;
