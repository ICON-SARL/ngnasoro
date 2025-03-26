
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Calendar, Plus, CreditCard, Wallet } from 'lucide-react';

interface QuickAccessCardProps {
  onAction: (action: string) => void;
}

const QuickAccessCard = ({ onAction }: QuickAccessCardProps) => {
  const quickContacts = [
    {
      name: 'Nguyen',
      avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png'
    },
    {
      name: 'Darrell',
      avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png'
    },
    {
      name: 'Annette',
      avatar: '/lovable-uploads/d416de2f-f3d5-4977-a429-b73a0c892013.png'
    }
  ];

  return (
    <div className="mx-4 -mt-10">
      <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-6">
            <p className="text-gray-500 mb-3">Quick transfer</p>
            <div className="flex space-x-4">
              <div 
                className="flex flex-col items-center"
                onClick={() => onAction('Add new')}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                  <Plus className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-xs">Add new</span>
              </div>
              
              {quickContacts.map((contact, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center" 
                  onClick={() => onAction('Transfer to ' + contact.name)}
                >
                  <Avatar className="w-12 h-12 mb-1">
                    <img src={contact.avatar} alt={contact.name} />
                  </Avatar>
                  <span className="text-xs">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="flex flex-col items-center p-4 rounded-xl bg-lime-50 cursor-pointer"
              onClick={() => onAction('Schedule transfer')}
            >
              <Calendar className="text-lime-600 mb-2 h-6 w-6" />
              <p className="text-lime-600 font-medium">Schedule transfer</p>
            </div>
            
            <div 
              className="flex flex-col items-center p-4 rounded-xl bg-lime-50 cursor-pointer"
              onClick={() => onAction('Loans')}
            >
              <CreditCard className="text-lime-600 mb-2 h-6 w-6" />
              <p className="text-lime-600 font-medium">View Loans</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAccessCard;
