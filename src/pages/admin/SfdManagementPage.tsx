
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const SfdManagementPage = () => {
  const { user, loading } = useAuth();
  const [sfds, setSfds] = useState([]);
  const [loadingSfds, setLoadingSfds] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des SFD</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des SFD</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSfds ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <p>Contenu à implémenter pour la gestion des SFD</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdManagementPage;
