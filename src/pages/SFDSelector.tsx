
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GeoAgencySelector from '@/components/GeoAgencySelector';
import AuthenticationSystem from '@/components/AuthenticationSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, ArrowRight, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SFDSelector = () => {
  const [currentStep, setCurrentStep] = useState<'selection' | 'authentication' | 'confirmation'>('selection');
  const [selectedSFD, setSelectedSFD] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSFDSelection = (sfdName: string) => {
    setSelectedSFD(sfdName);
    setCurrentStep('authentication');
  };

  const handleAuthenticationComplete = () => {
    setCurrentStep('confirmation');
  };

  const handleConfirmSelection = () => {
    // In a real app, this would save the selection and redirect to the dashboard
    navigate('/mobile-flow');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto pt-6">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="NGNA SÔRÔ! Logo" 
            className="h-16 mx-auto"
          />
          <h1 className="text-2xl font-bold mt-2">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
          </h1>
          <p className="text-sm text-[#0D6A51] mb-1">MEREF - Système Financier Décentralisé</p>
          
          <Badge className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">Multi-SFD Platform</Badge>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>
              {currentStep === 'selection' && "Sélectionnez votre SFD"}
              {currentStep === 'authentication' && "Vérification d'identité"}
              {currentStep === 'confirmation' && "Confirmation d'inscription"}
            </CardTitle>
            <CardDescription>
              {currentStep === 'selection' && "Choisissez l'agence SFD la plus proche ou celle qui correspond à vos besoins"}
              {currentStep === 'authentication' && "Complétez la vérification biométrique pour finaliser votre inscription"}
              {currentStep === 'confirmation' && "Vérifiez les détails de votre sélection avant de continuer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'selection' && (
              <div className="space-y-6">
                <GeoAgencySelector onSelectAgency={(agency) => handleSFDSelection(agency.name)} />
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <h3 className="font-medium flex items-center text-amber-800">
                    <Clock className="h-4 w-4 mr-2" />
                    Taux et offres en temps réel
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Les taux d'intérêt et offres spéciales sont spécifiques à chaque SFD et mis à jour en temps réel.
                  </p>
                </div>
              </div>
            )}
            
            {currentStep === 'authentication' && (
              <div className="space-y-6">
                <Alert className="mb-4">
                  <Building className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Inscription en cours pour <strong>{selectedSFD}</strong>
                  </AlertDescription>
                </Alert>
                
                <AuthenticationSystem onComplete={handleAuthenticationComplete} />
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep('selection')}>
                    Retour
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 'confirmation' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium flex items-center text-green-800">
                    <Shield className="h-4 w-4 mr-2" />
                    Inscription validée
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Votre identité a été vérifiée et enregistrée dans la base de données de {selectedSFD}.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="font-medium">Détails de votre compte</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Institution</span>
                      <span className="font-medium">{selectedSFD}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type de compte</span>
                      <span className="font-medium">Compte d'épargne</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taux d'épargne</span>
                      <span className="font-medium">3.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frais mensuels</span>
                      <span className="font-medium">0 FCFA</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep('authentication')}>
                    Retour
                  </Button>
                  <Button onClick={handleConfirmSelection} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
                    Finaliser l'inscription
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SFDSelector;
