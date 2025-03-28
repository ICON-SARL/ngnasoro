
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import InstantLoanForm from './loan/InstantLoanForm';

export default function InstantLoanPage() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4" 
        onClick={() => navigate('/mobile-flow')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <InstantLoanForm />
    </div>
  );
}
