
import React from 'react';

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="bg-white/90 p-4 rounded-full inline-block mb-3 shadow-lg">
        <img 
          src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
          alt="NGNA SÔRÔ! Logo" 
          className="h-20 mx-auto"
        />
      </div>
      <h1 className="text-3xl font-extrabold text-center text-white">
        <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-white">SÔRÔ!</span>
      </h1>
      <p className="text-base text-white/80 mt-1 text-center font-medium">MEREF - SFD</p>
    </div>
  );
};

export default Logo;
