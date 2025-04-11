
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoanApplicationForm from '@/components/loan-application/LoanApplicationForm';

const LoanApplicationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <LoanApplicationForm />
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationPage;
