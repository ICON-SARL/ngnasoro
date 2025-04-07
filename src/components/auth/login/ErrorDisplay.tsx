
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
