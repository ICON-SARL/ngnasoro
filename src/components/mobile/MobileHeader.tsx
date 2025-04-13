
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

interface MobileHeaderProps {
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title }) => {
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();
  
  const handleMenuOpen = () => {
    const event = new CustomEvent('lovable:action', { detail: { action: 'openMenu' } });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  };
  
  return (
    <div className="p-4 bg-[#0D6A51]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-white/20 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">RM</span>
          </div>
          <span className="text-white font-medium">RMCR</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white h-8 w-8 rounded-full bg-white/10 hover:bg-white/20">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white h-8 w-8 rounded-full bg-white/10 hover:bg-white/20" onClick={handleMenuOpen}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {title && (
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-white/80 text-sm">Bienvenue sur votre espace personnel</p>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;
