
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';

const SfdAdminListPage: React.FC = () => {
  const { user } = useAuth();
  const { admins, isLoading, error } = useSfdAdminManagement();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agency Administrators</h1>
          
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Administrator
          </Button>
        </div>
        
        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              Error loading administrators. Please try again.
            </div>
          ) : admins && admins.length > 0 ? (
            <div className="divide-y">
              {admins.map((admin) => (
                <div key={admin.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No administrators found. Add your first administrator.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SfdAdminListPage;
