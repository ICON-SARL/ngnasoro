
import React from 'react';

interface SfdSelectorLoadingProps {
  className?: string;
}

const SfdSelectorLoading: React.FC<SfdSelectorLoadingProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="bg-white text-gray-400 border-2 border-gray-300 px-3 py-2 h-10 rounded-lg w-full flex items-center justify-between">
        <div>Chargement des SFDs...</div>
        <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

export default SfdSelectorLoading;
