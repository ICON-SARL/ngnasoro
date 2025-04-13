
import React from 'react';
import ContextualHeader from './ContextualHeader';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

interface MobileHeaderProps {
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title }) => {
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();
  
  return (
    <div className="p-2">
      <ContextualHeader />
      
      {title && (
        <div className="px-2 mt-2">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;
