
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface FundsHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const FundsHeader = ({ onBack, onRefresh, isRefreshing }: FundsHeaderProps) => {
  return (
    <div className="bg-[#0D6A51] text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default FundsHeader;
