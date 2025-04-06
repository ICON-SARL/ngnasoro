
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Users, CreditCard, ArrowUpDown, BarChart3, Activity } from 'lucide-react';

export function IntegratedDashboard() {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Tableau de Bord MEREF-SFD</CardTitle>
        <CardDescription>Vue d'ensemble des activités des SFD</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 bg-gray-50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-white">Activités récentes</TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-white">Approbations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="py-2">
                  <CardDescription>Agences SFD actives</CardDescription>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">24</CardTitle>
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
              </Card>
              
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="py-2">
                  <CardDescription>Utilisateurs actifs</CardDescription>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">1,248</CardTitle>
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
              </Card>
              
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="py-2">
                  <CardDescription>Crédits actifs</CardDescription>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">387</CardTitle>
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
              </Card>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-800">Performance du Réseau SFD</h3>
              <Button variant="outline" size="sm" className="text-xs border-gray-200 hover:bg-gray-50">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Filtrer
              </Button>
            </div>
            
            <div className="rounded-lg border border-gray-100 h-[220px] bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Graphique de performance du réseau SFD</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activities">
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-800">Activités récentes des SFD</h3>
              
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">SFD Ngnasoro a approuvé un nouveau crédit</p>
                      <p className="text-xs text-gray-500">Il y a 2 heures · Agriculture</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full text-sm border-gray-200 hover:bg-gray-50">Voir toutes les activités</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="approvals">
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-800">Approbations en attente</h3>
              
              <div className="space-y-3">
                {[1, 2, 3].map((index) => (
                  <Card key={index} className="border border-gray-100 shadow-sm">
                    <CardHeader className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">Demande de financement #{index}00{index}</p>
                          <p className="text-xs text-gray-500">SFD Timbuktu · 15,000,000 FCFA</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs border-gray-200 hover:bg-gray-50">Examiner</Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              
              <Button variant="outline" className="w-full text-sm border-gray-200 hover:bg-gray-50">Voir toutes les demandes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
