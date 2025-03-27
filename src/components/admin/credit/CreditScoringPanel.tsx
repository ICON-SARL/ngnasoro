
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, LineChart, BarChart3, Save, PlusCircle, Calculator, Badge } from 'lucide-react';

export const CreditScoringPanel = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Criteria weights (total should be 100)
  const [criteria, setCriteria] = useState({
    creditHistory: 30,
    paymentHistory: 25,
    outstandingDebt: 15,
    loanAmount: 10,
    businessPerformance: 20
  });
  
  // Thresholds for auto approval/rejection
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(80);
  const [autoRejectionThreshold, setAutoRejectionThreshold] = useState(40);
  
  // Auto processing enabled
  const [autoProcessingEnabled, setAutoProcessingEnabled] = useState(true);
  
  const handleCriteriaChange = (name: keyof typeof criteria, value: number) => {
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSettings = () => {
    // Here would be logic to save to backend
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres du système de scoring ont été mis à jour",
    });
    setIsEditing(false);
  };
  
  // Calculate the total weight of all criteria
  const totalWeight = Object.values(criteria).reduce((sum, value) => sum + value, 0);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Système de Scoring Automatique
              </CardTitle>
              <CardDescription>
                Configurez les critères et les seuils pour l'évaluation automatique des demandes
              </CardDescription>
            </div>
            <div>
              {isEditing ? (
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="mr-2">
                  Annuler
                </Button>
              ) : null}
              <Button 
                onClick={isEditing ? saveSettings : () => setIsEditing(true)}
                variant={isEditing ? "default" : "outline"}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </>
                ) : (
                  "Modifier les paramètres"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="criteria">
            <TabsList className="mb-4">
              <TabsTrigger value="criteria">Critères de Scoring</TabsTrigger>
              <TabsTrigger value="thresholds">Seuils d'Approbation</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="criteria">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Pondération des Critères</h3>
                  {totalWeight !== 100 && isEditing && (
                    <div className="flex items-center text-amber-600 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Le total doit être de 100% (actuellement {totalWeight}%)
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Historique de Crédit</Label>
                      <div className="w-12 text-right">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={criteria.creditHistory}
                            onChange={(e) => handleCriteriaChange('creditHistory', parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{criteria.creditHistory}%</span>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <Slider 
                        value={[criteria.creditHistory]} 
                        min={0} 
                        max={100} 
                        step={5}
                        onValueChange={([value]) => handleCriteriaChange('creditHistory', value)}
                      />
                    ) : (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D6A51]" 
                          style={{ width: `${criteria.creditHistory}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Historique de Paiement</Label>
                      <div className="w-12 text-right">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={criteria.paymentHistory}
                            onChange={(e) => handleCriteriaChange('paymentHistory', parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{criteria.paymentHistory}%</span>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <Slider 
                        value={[criteria.paymentHistory]} 
                        min={0} 
                        max={100} 
                        step={5}
                        onValueChange={([value]) => handleCriteriaChange('paymentHistory', value)}
                      />
                    ) : (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D6A51]" 
                          style={{ width: `${criteria.paymentHistory}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Dette en cours</Label>
                      <div className="w-12 text-right">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={criteria.outstandingDebt}
                            onChange={(e) => handleCriteriaChange('outstandingDebt', parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{criteria.outstandingDebt}%</span>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <Slider 
                        value={[criteria.outstandingDebt]} 
                        min={0} 
                        max={100} 
                        step={5}
                        onValueChange={([value]) => handleCriteriaChange('outstandingDebt', value)}
                      />
                    ) : (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D6A51]" 
                          style={{ width: `${criteria.outstandingDebt}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Montant du Prêt</Label>
                      <div className="w-12 text-right">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={criteria.loanAmount}
                            onChange={(e) => handleCriteriaChange('loanAmount', parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{criteria.loanAmount}%</span>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <Slider 
                        value={[criteria.loanAmount]} 
                        min={0} 
                        max={100} 
                        step={5}
                        onValueChange={([value]) => handleCriteriaChange('loanAmount', value)}
                      />
                    ) : (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D6A51]" 
                          style={{ width: `${criteria.loanAmount}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Performance de l'Entreprise</Label>
                      <div className="w-12 text-right">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={criteria.businessPerformance}
                            onChange={(e) => handleCriteriaChange('businessPerformance', parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{criteria.businessPerformance}%</span>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <Slider 
                        value={[criteria.businessPerformance]} 
                        min={0} 
                        max={100} 
                        step={5}
                        onValueChange={([value]) => handleCriteriaChange('businessPerformance', value)}
                      />
                    ) : (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D6A51]" 
                          style={{ width: `${criteria.businessPerformance}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setCriteria({
                        creditHistory: 30,
                        paymentHistory: 25,
                        outstandingDebt: 15,
                        loanAmount: 10,
                        businessPerformance: 20
                      });
                    }}
                  >
                    Réinitialiser les valeurs par défaut
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="thresholds">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium">Traitement Automatique</h3>
                    <div className="ml-4">
                      <Switch 
                        checked={autoProcessingEnabled} 
                        onCheckedChange={setAutoProcessingEnabled}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Seuil d'Approbation Automatique</Label>
                    <div className="flex items-center">
                      <div className="flex-1 mr-4">
                        {isEditing ? (
                          <Slider 
                            value={[autoApprovalThreshold]} 
                            min={0} 
                            max={100} 
                            step={5}
                            onValueChange={([value]) => setAutoApprovalThreshold(value)}
                            disabled={!autoProcessingEnabled}
                          />
                        ) : (
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${autoApprovalThreshold}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <div className="w-16 text-right">
                        {isEditing && autoProcessingEnabled ? (
                          <Input 
                            type="number" 
                            value={autoApprovalThreshold}
                            onChange={(e) => setAutoApprovalThreshold(parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{autoApprovalThreshold}%</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Les demandes avec un score supérieur à ce seuil seront automatiquement approuvées
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Seuil de Rejet Automatique</Label>
                    <div className="flex items-center">
                      <div className="flex-1 mr-4">
                        {isEditing ? (
                          <Slider 
                            value={[autoRejectionThreshold]} 
                            min={0} 
                            max={100} 
                            step={5}
                            onValueChange={([value]) => setAutoRejectionThreshold(value)}
                            disabled={!autoProcessingEnabled}
                          />
                        ) : (
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: `${autoRejectionThreshold}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <div className="w-16 text-right">
                        {isEditing && autoProcessingEnabled ? (
                          <Input 
                            type="number" 
                            value={autoRejectionThreshold}
                            onChange={(e) => setAutoRejectionThreshold(parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                          />
                        ) : (
                          <span className="font-medium">{autoRejectionThreshold}%</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Les demandes avec un score inférieur à ce seuil seront automatiquement rejetées
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Interprétation des scores</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">{autoApprovalThreshold}-100: Approbation automatique</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm">{autoRejectionThreshold}-{autoApprovalThreshold}: Revue manuelle requise</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">0-{autoRejectionThreshold}: Rejet automatique</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Distribution des scores</p>
                    </div>
                  </div>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Évolution des scores dans le temps</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Statistiques d'approbation</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-500">Taux d'approbation</div>
                      <div className="text-xl font-bold">67%</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-500">Score moyen</div>
                      <div className="text-xl font-bold">62/100</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-500">Taux de défaut</div>
                      <div className="text-xl font-bold">4.2%</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
