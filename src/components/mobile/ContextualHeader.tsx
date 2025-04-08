
import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ContextualHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const ContextualHeader: React.FC<ContextualHeaderProps> = ({ 
  title = "Page", 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ContextualHeader;
