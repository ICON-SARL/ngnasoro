
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddSfdButton = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/mobile-flow/sfd-selector');
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center py-6 border-dashed"
      onClick={handleClick}
    >
      <Plus className="h-5 w-5 mr-2" />
      Ajouter un compte SFD
    </Button>
  );
};

export default AddSfdButton;
