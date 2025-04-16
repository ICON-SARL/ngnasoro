
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/login/LoginForm';

const ClientLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Connexion Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm userType="client" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLoginPage;
