
import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-red-800">
            Erreur de connexion
          </h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
