
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline" 
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        
        <Button 
          onClick={() => navigate('/')}
          className="bg-green-600 hover:bg-green-700"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
