
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '../login/LoginForm';
import RegisterForm from '../RegisterForm';
import AuthHeader from './AuthHeader';
import AuthLinks from './AuthLinks';
import DemoAccountsCreator from '../DemoAccountsCreator';

interface AuthContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authMode: 'default' | 'admin' | 'sfd_admin';
}

const AuthContent: React.FC<AuthContentProps> = ({ activeTab, setActiveTab, authMode }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <AuthHeader mode={authMode} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="login">Connexion</TabsTrigger>
          <TabsTrigger value="register">Inscription</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm adminMode={authMode === 'admin'} isSfdAdmin={authMode === 'sfd_admin'} />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
      
      <AuthLinks mode={authMode} />
      
      <DemoAccountsCreator />
    </div>
  );
};

export default AuthContent;
