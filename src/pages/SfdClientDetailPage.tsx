
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSfdClientDetails } from '@/hooks/useSfdClientDetails';
import ClientDetailsView from '@/components/sfd/client-details/ClientDetailsView';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Loader } from '@/components/ui/loader';

const SfdClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { client, isLoading, error } = useSfdClientDetails(clientId);

  const handleClose = () => {
    navigate('/sfd-clients');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-center">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-12 px-4">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Client non trouvé</h2>
              <p className="text-gray-600 mt-2">
                {error || "Impossible de charger les détails du client."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/sfd-clients')}
              >
                Retour aux clients
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 flex items-center text-gray-500"
            onClick={handleClose}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour aux clients
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <ClientDetailsView 
            client={client} 
            onClose={handleClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default SfdClientDetailPage;
