
import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SfdListPopup from './SfdListPopup';

interface ViewAllSfdsButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ViewAllSfdsButton: React.FC<ViewAllSfdsButtonProps> = ({ 
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [showSfdList, setShowSfdList] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowSfdList(true)}
        className={`w-full ${className}`}
      >
        <Building className="h-4 w-4 mr-2" />
        Voir les SFDs disponibles
      </Button>

      <SfdListPopup 
        isOpen={showSfdList}
        onClose={() => setShowSfdList(false)}
      />
    </>
  );
};

export default ViewAllSfdsButton;
