
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProfileHeader from './ProfileHeader';
import { useAuth } from '@/hooks/useAuth';
import SfdAccountsSection from './SfdAccountsSection';

const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {/* Profile Header with User Info */}
      <ProfileHeader />

      {/* SFD Accounts Section */}
      <div className="p-4">
        <SfdAccountsSection />
      </div>
    </div>
  );
};

export default ClientProfilePage;
