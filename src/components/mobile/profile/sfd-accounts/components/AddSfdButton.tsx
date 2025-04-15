
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddSfdButtonProps {
  onAddSfd?: () => void;
}

const AddSfdButton: React.FC<AddSfdButtonProps> = ({ onAddSfd }) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddSfd) {
      onAddSfd();
    } else {
      navigate('/sfd-setup');
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center py-6 border-dashed"
      onClick={handleClick}
    >
      <PlusCircle className="h-5 w-5 mr-2" />
      Ajouter un compte SFD
    </Button>
  );
};

export default AddSfdButton;
