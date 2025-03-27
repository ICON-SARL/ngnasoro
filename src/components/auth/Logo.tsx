
import React from 'react';

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="bg-white p-4 rounded-lg inline-block mb-3 shadow-md">
        <img 
          src="/lovable-uploads/cb7bbf5f-00ce-4584-a259-df0f14dc7d98.png" 
          alt="Logo" 
          className="h-14 mx-auto"
        />
      </div>
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Identifiez-vous
      </h1>
    </div>
  );
};

export default Logo;
