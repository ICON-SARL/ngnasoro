
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SfdSelector from '@/components/mobile/profile/sfd-accounts/SfdSelector';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

const SfdSelectorPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  const handleRequestSent = () => {
    toast({
      title: "Demande envoyée",
      description: "Votre demande a été envoyée avec succès. Elle sera traitée par l'administrateur de la SFD.",
    });
    
    // Redirect to mobile flow or welcome page
    navigate('/mobile-flow/welcome');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="container max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#0D6A51]">
              Bienvenue sur N'gna sôrô
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pb-6">
            <div className="mb-4 text-center text-muted-foreground">
              <p>Pour commencer à utiliser l'application, veuillez sélectionner la SFD dont vous êtes client.</p>
            </div>
            
            {user && <SfdSelector userId={user.id} onRequestSent={handleRequestSent} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdSelectorPage;
