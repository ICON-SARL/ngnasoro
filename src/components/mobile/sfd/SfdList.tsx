
import React from 'react';
import { Card } from '@/components/ui/card';
import { SfdListItem } from './SfdListItem';
import { Loader2 } from 'lucide-react';

interface SfdListProps {
  sfds: any[];
  existingRequests: { sfd_id: string, status: string }[];
  isSubmitting: boolean;
  onSelectSfd?: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({ 
  sfds,
  existingRequests,
  isSubmitting,
  onSelectSfd
}) => {
  if (!sfds || sfds.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune SFD disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sfds.map(sfd => {
        const isPending = existingRequests.some(req => 
          req.sfd_id === sfd.id && req.status === 'pending'
        );
        
        return (
          <Card key={sfd.id} className="overflow-hidden">
            <SfdListItem
              sfd={sfd}
              isPending={isPending || isSubmitting}
              onClick={() => onSelectSfd && onSelectSfd(sfd.id)}
            />
          </Card>
        );
      })}
    </div>
  );
};

export default SfdList;
