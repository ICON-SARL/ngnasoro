
import React from 'react';
import { Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SfdCardProps {
  name: string;
  code: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SfdCard: React.FC<SfdCardProps> = ({ name, code, isActive = false, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/mobile-flow/sfds');
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-xl flex items-center space-x-3 cursor-pointer transition-all ${
        isActive 
          ? 'bg-[#0D6A51]/10 border border-[#0D6A51]/20' 
          : 'bg-white border border-gray-100 hover:border-[#0D6A51]/20'
      }`}
      onClick={handleClick}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
        isActive ? 'bg-[#0D6A51]/10' : 'bg-gray-100'
      }`}>
        <Building className={`h-5 w-5 ${isActive ? 'text-[#0D6A51]' : 'text-gray-500'}`} />
      </div>
      <div>
        <h3 className={`font-medium ${isActive ? 'text-[#0D6A51]' : 'text-gray-800'}`}>{name}</h3>
        <p className="text-xs text-gray-500">{code}</p>
      </div>
    </div>
  );
};

export default SfdCard;
