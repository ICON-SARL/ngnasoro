
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddSfdButtonProps {
  onAddSfd?: () => void;
}

const AddSfdButton: React.FC<AddSfdButtonProps> = ({ onAddSfd }) => {
  const navigate = useNavigate();
  
  const handleAddSfd = () => {
    if (onAddSfd) {
      onAddSfd();
    } else {
      navigate('/sfd-setup');
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="w-full mt-3 border-dashed flex items-center justify-center"
      onClick={handleAddSfd}
    >
      <Plus className="h-4 w-4 mr-2" />
      Ajouter une SFD
    </Button>
  );
};

export default AddSfdButton;
