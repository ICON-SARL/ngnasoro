
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewAllSfdsButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
}

const ViewAllSfdsButton: React.FC<ViewAllSfdsButtonProps> = ({ 
  className = "",
  variant = "default"
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/sfd-selector');
  };

  return (
    <Button
      onClick={handleClick}
      className={`w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 ${className}`}
      variant={variant}
    >
      <Building className="h-4 w-4 mr-2" />
      Voir tous les SFDs disponibles
    </Button>
  );
};

export default ViewAllSfdsButton;
