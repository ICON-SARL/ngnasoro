
import React from 'react';

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="auth-logo-container">
        <img 
          src="/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png" 
          alt="N'GNA SÔRÔ Logo" 
          className="h-24 mx-auto"
        />
      </div>
      <h1 className="text-2xl font-bold text-center text-[#0D6A51]">
        Identifiez-vous
      </h1>
    </div>
  );
};

export default Logo;
