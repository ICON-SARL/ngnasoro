
import React from 'react';
import { Building, CheckCircle, Loader2 } from 'lucide-react';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status?: string;
  logo_url?: string;
}

interface SfdListProps {
  sfds?: Sfd[];
  onSelectSfd: (sfdId: string) => void;
  existingRequests: { sfd_id: string; status: string }[];
  isSubmitting: boolean;
}

const SfdList: React.FC<SfdListProps> = ({ 
  sfds = [], 
  onSelectSfd, 
  existingRequests, 
  isSubmitting 
}) => {
  const [selectedSfdId, setSelectedSfdId] = React.useState<string | null>(null);

  // Ensure we only show active SFDs
  const activeSfds = React.useMemo(() => {
    console.log('Filtering active SFDs:', sfds);
    return sfds.filter(sfd => sfd.status === 'active');
  }, [sfds]);

  const handleSelectSfd = (sfdId: string) => {
    setSelectedSfdId(sfdId);
    onSelectSfd(sfdId);
  };

  const getRequestStatus = (sfdId: string) => {
    const request = existingRequests.find(req => req.sfd_id === sfdId);
    return request?.status || null;
  };

  if (activeSfds.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600">Aucune SFD disponible pour le moment.</p>
        <p className="text-sm text-gray-500 mt-2">
          Veuillez réessayer plus tard ou contacter le support MEREF.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeSfds.map(sfd => {
        const requestStatus = getRequestStatus(sfd.id);
        const isRequested = !!requestStatus;
        const isApproved = requestStatus === 'validated' || requestStatus === 'approved';
        const isPending = requestStatus === 'pending';

        return (
          <div
            key={sfd.id}
            className={`flex items-center p-4 border rounded-lg ${
              isSubmitting && selectedSfdId === sfd.id
                ? 'border-blue-300 bg-blue-50'
                : isApproved
                ? 'border-green-300 bg-green-50'
                : isPending
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
            } transition-colors`}
            onClick={() => !isRequested && !isSubmitting && handleSelectSfd(sfd.id)}
          >
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 overflow-hidden">
              {sfd.logo_url ? (
                <img
                  src={sfd.logo_url}
                  alt={sfd.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-500">
                  {sfd.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{sfd.name}</h3>
              <p className="text-sm text-gray-500">
                {sfd.region || `Code: ${sfd.code}`}
              </p>
            </div>
            <div className="ml-3">
              {isSubmitting && selectedSfdId === sfd.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : isApproved ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-xs font-medium">Client</span>
                </div>
              ) : isPending ? (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                  En attente
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SfdList;
