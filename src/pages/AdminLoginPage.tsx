
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/login/LoginForm';
import { Shield } from 'lucide-react';

const AdminLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-center">
              Admin MEREF
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm adminMode={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
