
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MobileHeader = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Utilisateur';

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center mr-2">
          <span className="text-black font-bold">$</span>
        </div>
        <h1 className="text-xl font-bold text-white">InstingLoan</h1>
      </div>
      <Bell className="h-6 w-6 text-white" />
    </div>
  );
};

export default MobileHeader;
