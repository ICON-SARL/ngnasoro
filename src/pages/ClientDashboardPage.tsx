
import React from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { Container } from '@/components/ui/container';
import { UserWelcome } from '@/components/UserWelcome';
import { MultiSfdAccountsView } from '@/components/client/MultiSfdAccountsView';
import { useAuth } from '@/hooks/useAuth';

export function ClientDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNav />
      
      <Container className="py-6">
        <UserWelcome user={user} className="mb-6" />
        <MultiSfdAccountsView />
      </Container>
    </div>
  );
}

export default ClientDashboardPage;
