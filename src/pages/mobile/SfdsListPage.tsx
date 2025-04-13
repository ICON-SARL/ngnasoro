
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SfdsList from '@/components/mobile/sfd/SfdsList';

const SfdsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0D6A51] text-white p-4 flex items-center shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 text-white hover:bg-[#0D6A51]/20" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Mes SFDs</h1>
      </div>
      
      <div className="p-4">
        <SfdsList />
      </div>
    </div>
  );
};

export default SfdsListPage;
