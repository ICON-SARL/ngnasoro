
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 w-40 bg-gray-200 rounded"></div>
        <div className="h-5 w-20 bg-gray-200 rounded"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded-xl">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-xl">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="mt-3 h-10 w-full bg-gray-200 rounded-xl"></div>
    </div>
  );
};

export default LoadingState;
