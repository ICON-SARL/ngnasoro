
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ViewAllSfdsButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="outline"
      className="w-full flex justify-center items-center py-2"
      onClick={() => navigate('/mobile-flow/sfds')}
    >
      Voir tous mes SFDs
      <ChevronRight className="h-4 w-4 ml-1" />
    </Button>
  );
};

export default ViewAllSfdsButton;
