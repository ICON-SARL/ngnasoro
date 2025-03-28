
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, BarChart3, Calculator, Shield, Gauge } from 'lucide-react';

export const CreditScoringPanel = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [scoringConfig, setScoringConfig] = useState({
    // Weights for scoring factors
    weights: {
      creditHistory: 30,
      financialStability: 25,
      loanAmount: 15,
      collateral: 20,
      marketConditions: 10
    },
    // Thresholds for automatic decisions
    thresholds: {
      autoApproval: 80,
      autoRejection: 40,
      manualReview: [40, 80] // Range for manual review
    },
    // General settings
    settings: {
      enableAutoDecisions: true,
      scoreVisibilityToSfd: true,
      maxLoanMultiplier: 3,
      minScore: 0,
      maxScore: 100
    }
  });

  const handleWeightChange = (factor: keyof typeof scoringConfig.weights, value: number) => {
    setScoringConfig(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [factor]: value
      }
    }));
  };

  const handleThresholdChange = (threshold: keyof typeof scoringConfig.thresholds, value: number | number[]) => {
    setScoringConfig(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [threshold]: value
      }
    }));
  };

  const handleSettingChange = (setting: keyof typeof scoringConfig.settings, value: boolean | number) => {
    setScoringConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const saveSettings = () => {
    // Validate weights sum to 100
    const totalWeight = Object.values(scoringConfig.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      toast({
        title: "Erreur de configuration",
        description: `La somme des pondérations doit être égale à 100%. Actuellement: ${totalWeight}%`,
        variant: "destructive"
      });
      return;
    }

    // Here we would save to backend
    // In a real implementation we'd make an API call
    toast({
      title: "Configuration enregistrée",
      description: "Les paramètres du système de scoring ont été mis à jour",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Système de Scoring de Crédit
              </CardTitle>
              <CardDescription>
                Configurez les paramètres du système de scoring automatique pour l'évaluation des demandes de crédit
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
                  "Modifier la configuration"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="weights">
            <TabsList>
              <TabsTrigger value="weights">
                <BarChart3 className="h-4 w-4 mr-1" />
                Pondérations
              </TabsTrigger>
              <TabsTrigger value="thresholds">
                <Gauge className="h-4 w-4 mr-1" />
                Seuils
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Shield className="h-4 w-4 mr-1" />
                Paramètres généraux
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weights" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                Définissez l'importance relative de chaque facteur dans le calcul du score (la somme doit être égale à 100%)
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Historique de crédit</Label>
                    <span className="text-sm font-medium">{scoringConfig.weights.creditHistory}%</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.weights.creditHistory]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleWeightChange('creditHistory', value)}
                  />
                  <p className="text-xs text-muted-foreground">Évaluation basée sur les remboursements passés et l'historique avec le SFD</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Stabilité financière</Label>
                    <span className="text-sm font-medium">{scoringConfig.weights.financialStability}%</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.weights.financialStability]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleWeightChange('financialStability', value)}
                  />
                  <p className="text-xs text-muted-foreground">Santé financière du SFD selon les derniers rapports</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Montant du prêt</Label>
                    <span className="text-sm font-medium">{scoringConfig.weights.loanAmount}%</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.weights.loanAmount]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleWeightChange('loanAmount', value)}
                  />
                  <p className="text-xs text-muted-foreground">Impact du montant demandé par rapport aux capacités du SFD</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Garanties</Label>
                    <span className="text-sm font-medium">{scoringConfig.weights.collateral}%</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.weights.collateral]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleWeightChange('collateral', value)}
                  />
                  <p className="text-xs text-muted-foreground">Évaluation des garanties fournies par le SFD</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Conditions du marché</Label>
                    <span className="text-sm font-medium">{scoringConfig.weights.marketConditions}%</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.weights.marketConditions]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleWeightChange('marketConditions', value)}
                  />
                  <p className="text-xs text-muted-foreground">Facteurs externes liés au secteur et à la région</p>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <span className="font-medium">Total</span>
                  <span className={`font-bold text-lg ${
                    Object.values(scoringConfig.weights).reduce((sum, weight) => sum + weight, 0) === 100 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Object.values(scoringConfig.weights).reduce((sum, weight) => sum + weight, 0)}%
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                Définissez les seuils pour la prise de décision automatique
              </p>

              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Seuil d'approbation automatique</Label>
                    <span className="text-sm font-medium">{scoringConfig.thresholds.autoApproval}</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.thresholds.autoApproval]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleThresholdChange('autoApproval', value)}
                  />
                  <p className="text-xs text-muted-foreground">Les demandes avec un score supérieur à cette valeur seront approuvées automatiquement</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Seuil de rejet automatique</Label>
                    <span className="text-sm font-medium">{scoringConfig.thresholds.autoRejection}</span>
                  </div>
                  <Slider 
                    value={[scoringConfig.thresholds.autoRejection]} 
                    min={0} 
                    max={100} 
                    step={5}
                    disabled={!isEditing}
                    onValueChange={([value]) => handleThresholdChange('autoRejection', value)}
                  />
                  <p className="text-xs text-muted-foreground">Les demandes avec un score inférieur à cette valeur seront rejetées automatiquement</p>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Plage de revue manuelle</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Les demandes dont le score se situe entre le seuil de rejet et d'approbation automatiques nécessiteront une revue manuelle
                  </p>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Revue manuelle actuelle:</span> Score entre {scoringConfig.thresholds.autoRejection} et {scoringConfig.thresholds.autoApproval}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                Paramètres généraux du système de scoring
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-decisions">Activer les décisions automatiques</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Approuver ou rejeter automatiquement les demandes selon les seuils définis
                    </p>
                  </div>
                  <Switch 
                    id="auto-decisions" 
                    checked={scoringConfig.settings.enableAutoDecisions} 
                    onCheckedChange={(checked) => handleSettingChange('enableAutoDecisions', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="score-visibility">Montrer le score aux SFDs</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permettre aux SFDs de voir leur score de solvabilité
                    </p>
                  </div>
                  <Switch 
                    id="score-visibility" 
                    checked={scoringConfig.settings.scoreVisibilityToSfd} 
                    onCheckedChange={(checked) => handleSettingChange('scoreVisibilityToSfd', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-loan-multiplier">Multiplicateur maximum de prêt</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Facteur maximum par rapport au capital propre du SFD
                    </p>
                    <div className="flex items-center mt-2">
                      <Input 
                        id="max-loan-multiplier" 
                        type="number" 
                        min={1} 
                        max={10} 
                        step={0.5}
                        value={scoringConfig.settings.maxLoanMultiplier} 
                        onChange={(e) => handleSettingChange('maxLoanMultiplier', parseFloat(e.target.value))}
                        disabled={!isEditing}
                        className="w-20"
                      />
                      <span className="ml-2 text-sm">× Capital propre</span>
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
