
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MobileDiagnosticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate('/mobile-flow/profile');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Diagnostics</h1>
      </div>

      <Card className="p-4 mb-4">
        <h2 className="font-semibold mb-2">User Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Role:</strong> {user?.app_metadata?.role || 'No role assigned'}</p>
          <p><strong>Auth Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">Client Status Check</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Client Verification:</strong> Checking association with SFD...</p>
          <div className="mt-2">
            <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
              {JSON.stringify({
                user_id: user?.id,
                timestamp: new Date().toISOString(),
                status: 'diagnostic_check'
              }, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileDiagnosticsPage;
