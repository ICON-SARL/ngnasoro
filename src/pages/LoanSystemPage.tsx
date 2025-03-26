
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, User, Calculator, Signature, Calendar, Building, FileInput, RefreshCw, BellRing, ArrowLeft } from 'lucide-react';
import { LoanSimulator } from '@/components/LoanSimulator';
import { ElectronicSignature } from '@/components/ElectronicSignature';
import { RepaymentCalendar } from '@/components/RepaymentCalendar';
import { PaymentOptions } from '@/components/PaymentOptions';
import { CollateralManagement } from '@/components/CollateralManagement';
import { RepaymentRescheduling } from '@/components/RepaymentRescheduling';
import { LatePaymentAlerts } from '@/components/LatePaymentAlerts';
import { Link } from 'react-router-dom';

const LoanSystemPage = () => {
  const [clientView, setClientView] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
              alt="NGNA SÔRÔ! Logo" 
              className="h-8"
            />
            <div className="ml-2">
              <h1 className="text-lg font-semibold flex items-center">
                <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
                <Badge className="ml-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-xs">Prêts</Badge>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/super-admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour au tableau de bord
              </Button>
            </Link>
            <Button 
              variant={clientView ? "default" : "outline"} 
              size="sm"
              onClick={() => setClientView(true)}
              className={clientView ? "bg-[#0D6A51] hover:bg-[#0D6A51]/90" : ""}
            >
              <User className="h-4 w-4 mr-1" />
              Vue Client
            </Button>
            <Button 
              variant={!clientView ? "default" : "outline"} 
              size="sm"
              onClick={() => setClientView(false)}
              className={!clientView ? "bg-[#0D6A51] hover:bg-[#0D6A51]/90" : ""}
            >
              <Building className="h-4 w-4 mr-1" />
              Vue Admin
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Système de Prêt End-to-End</h2>
          <p className="text-muted-foreground">
            Gestion complète des prêts, de la simulation à la signature et au remboursement
          </p>
        </div>
        
        {clientView ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Calculator className="h-4 w-4 mr-2 text-[#0D6A51]" />
                    Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">38,736 FCFA</div>
                  <p className="text-sm text-muted-foreground">Mensualité estimée</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Signature className="h-4 w-4 mr-2 text-[#0D6A51]" />
                    Contrat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">DocuSign</div>
                  <p className="text-sm text-muted-foreground">Signature électronique</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#0D6A51]" />
                    Paiements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Échéances totales</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="simulator">
              <TabsList className="mb-6">
                <TabsTrigger value="simulator">
                  <Calculator className="h-4 w-4 mr-2" />
                  Simulateur
                </TabsTrigger>
                <TabsTrigger value="signature">
                  <Signature className="h-4 w-4 mr-2" />
                  Signature
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendrier
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Paiements
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="simulator">
                <LoanSimulator />
              </TabsContent>
              
              <TabsContent value="signature">
                <ElectronicSignature />
              </TabsContent>
              
              <TabsContent value="calendar">
                <RepaymentCalendar />
              </TabsContent>
              
              <TabsContent value="payments">
                <PaymentOptions />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <FileInput className="h-4 w-4 mr-2 text-[#0D6A51]" />
                    Garanties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-sm text-muted-foreground">Types de garanties</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 text-[#0D6A51]" />
                    Reprogrammations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-sm text-muted-foreground">Taux de succès</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BellRing className="h-4 w-4 mr-2 text-[#0D6A51]" />
                    Alertes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-sm text-muted-foreground">Retards en cours</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="collateral">
              <TabsList className="mb-6">
                <TabsTrigger value="collateral">
                  <FileInput className="h-4 w-4 mr-2" />
                  Garanties
                </TabsTrigger>
                <TabsTrigger value="rescheduling">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reprogrammation
                </TabsTrigger>
                <TabsTrigger value="alerts">
                  <BellRing className="h-4 w-4 mr-2" />
                  Alertes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="collateral">
                <CollateralManagement />
              </TabsContent>
              
              <TabsContent value="rescheduling">
                <RepaymentRescheduling />
              </TabsContent>
              
              <TabsContent value="alerts">
                <LatePaymentAlerts />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default LoanSystemPage;
