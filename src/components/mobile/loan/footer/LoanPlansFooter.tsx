
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LoanPlansFooter = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
      <Button 
        onClick={() => navigate('/mobile-flow/loan-application')}
        className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
      >
        Faire une demande de prêt
      </Button>
    </div>
  );
};
