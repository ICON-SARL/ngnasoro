
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface FloatingMenuButtonProps {
  onClick: () => void;
}

const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({ onClick }) => {
  return (
    <Button
      className="fixed bottom-20 right-4 z-50 rounded-full w-12 h-12 bg-[#0D6A51] shadow-lg"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export default FloatingMenuButton;
