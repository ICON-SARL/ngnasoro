
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Sfd {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logo_url?: string;
}

interface SfdItemProps {
  sfd: Sfd;
  isSelected: boolean;
  onSelect: () => void;
}

const SfdItem: React.FC<SfdItemProps> = ({ sfd, isSelected, onSelect }) => {
  return (
    <Card 
      className={`cursor-pointer border transition-colors ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {sfd.logo_url ? (
            <img 
              src={sfd.logo_url} 
              alt={sfd.name} 
              className="h-10 w-10 mr-3 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 mr-3 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">{sfd.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h4 className="font-medium">{sfd.name}</h4>
            <p className="text-sm text-muted-foreground">
              {sfd.region || sfd.code}
            </p>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 ${
          isSelected
            ? 'border-primary bg-primary' 
            : 'border-gray-300'
        }`}/>
      </CardContent>
    </Card>
  );
};

export default SfdItem;
