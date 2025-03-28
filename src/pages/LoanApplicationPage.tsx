
import React from 'react';
import ClientLoanApplication from '@/components/ClientLoanApplication';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/loans')} 
          className="text-sm flex items-center text-gray-500 hover:text-gray-700"
        >
          ← Retour aux prêts
        </button>
        <h1 className="text-2xl font-bold mt-2">Demande de prêt</h1>
      </div>
      
      <ClientLoanApplication />
    </div>
  );
};

export default LoanApplicationPage;
