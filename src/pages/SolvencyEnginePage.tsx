
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const SolvencyEnginePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Veuillez vous connecter</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Moteur de Solvabilité</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Analyse de Solvabilité</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fonctionnalité en cours d'implémentation.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolvencyEnginePage;
