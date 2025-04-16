
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const LoanPlansHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-4 shadow-sm flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/mobile-flow/loans')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-semibold">Plans de prêt</h1>
    </div>
  );
};
