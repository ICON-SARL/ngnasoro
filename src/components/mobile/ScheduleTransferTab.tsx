
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Calendar, Clock, ChevronDown, ArrowLeft } from 'lucide-react';

export interface ScheduleTransferTabProps {
  onBack?: () => void;
}

const ScheduleTransferTab = ({ onBack }: ScheduleTransferTabProps) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('840');
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  const recentContacts = [
    { name: 'Nguyen', avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png' },
    { name: 'Darrell', avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png' },
    { name: 'Annette', avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png' },
    { name: 'Bessie', avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png' },
    { name: 'Devon', avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png' },
  ];
  
  return (
    <div className="bg-white min-h-screen">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Schedule Transfer</h2>
        </div>
        
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold">$</span>
              <span className="text-5xl font-bold">{amount}</span>
              <span className="text-5xl font-bold text-gray-300">.00</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="text-gray-500 text-sm mb-1 block">To:</label>
            <Input 
              type="text" 
              placeholder="Enter email or account number"
              className="h-12 border-gray-200"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Most recent</p>
              <button className="text-sm text-blue-600">See All</button>
            </div>
            
            <div className="flex overflow-x-auto space-x-4 py-3 no-scrollbar">
              {recentContacts.map((contact, index) => (
                <div key={index} className="flex flex-col items-center flex-shrink-0">
                  <Avatar className="h-12 w-12 mb-1">
                    <img src={contact.avatar} alt={contact.name} />
                  </Avatar>
                  <span className="text-xs">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Your balance</p>
              <p className="font-medium">$2,024.8</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center">
                <label className="text-gray-500 text-sm">Date:</label>
                <div className="flex items-center ml-2 text-gray-800">
                  <span>DD/MM/YYYY</span>
                  <Calendar className="h-4 w-4 ml-2 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center">
                <label className="text-gray-500 text-sm">Time:</label>
                <div className="flex items-center ml-2 text-gray-800">
                  <span>HH/MM</span>
                  <Clock className="h-4 w-4 ml-2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">
              <label className="text-gray-600">Repeat:</label>
              <div className="flex items-center text-gray-800">
                <span>None</span>
                <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700"
          >
            Schedule Transfer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTransferTab;
