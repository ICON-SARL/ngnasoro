
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authMode: 'default' | 'admin' | 'sfd';
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, setActiveTab, authMode }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="login">Connexion</TabsTrigger>
        {authMode === 'default' && (
          <TabsTrigger value="register">Inscription</TabsTrigger>
        )}
        {authMode !== 'default' && (
          <TabsTrigger value="register" disabled>Inscription</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="login">
        <LoginForm adminMode={authMode === 'admin'} sfdMode={authMode === 'sfd'} />
      </TabsContent>
      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
