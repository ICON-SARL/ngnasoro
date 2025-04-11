
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface AddSfdButtonProps {
  onAddSfd?: () => void;
}

const AddSfdButton: React.FC<AddSfdButtonProps> = ({ onAddSfd }) => {
  if (!onAddSfd) return null;
  
  return (
    <button
      className="flex items-center justify-center w-full p-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      onClick={onAddSfd}
    >
      <PlusCircle className="h-5 w-5 mr-2 text-gray-500" />
      <span className="text-sm text-gray-600 font-medium">Associer un nouvel SFD</span>
    </button>
  );
};

export default AddSfdButton;
