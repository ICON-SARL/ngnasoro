
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart4, 
  Save, 
  PlusCircle, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  ChevronRight, 
  ListFilter,
  History,
  Star,
  AlertTriangle
} from 'lucide-react';

export const CreditScoringPanel = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Scoring system state
  const [isAutomaticScoringEnabled, setIsAutomaticScoringEnabled] = useState(true);
  const [scoringCriteria, setScoringCriteria] = useState([
    {
      id: '1',
      name: 'Historique de remboursement',
      description: 'Évalue la performance passée dans le remboursement des crédits',
      weight: 30,
      enabled: true
    },
    {
      id: '2',
      name: 'Montant demandé',
      description: 'Impact du montant de crédit demandé par rapport à la taille de la SFD',
      weight: 15,
      enabled: true
    },
    {
      id: '3',
      name: 'Ancienneté de la SFD',
      description: 'Nombre d\'années d\'existence de la SFD',
      weight: 20,
      enabled: true
    },
    {
      id: '4',
      name: 'Santé financière',
      description: 'Évaluation des états financiers et des ratios clés',
      weight: 25,
      enabled: true
    },
    {
      id: '5',
      name: 'Diversification du portefeuille',
      description: 'Diversité des produits et services offerts par la SFD',
      weight: 10,
      enabled: true
    }
  ]);
  
  // Add new criteria state
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaDescription, setNewCriteriaDescription] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState(10);
  
  // Simulation state
  const [simulationData, setSimulationData] = useState({
    sfdHistory: 'good', // 'excellent', 'good', 'fair', 'poor'
    requestAmount: 5000000,
    sfdAge: 5,
    financialHealth: 'good',
    portfolioDiversity: 'medium'
  });
  
  // Calculate the total weight of enabled criteria
  const totalWeight = scoringCriteria
    .filter(criteria => criteria.enabled)
    .reduce((sum, criteria) => sum + criteria.weight, 0);
  
  // Handle saving the scoring configuration
  const saveConfiguration = () => {
    // Here would be API call to save configuration
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres de scoring ont été mis à jour"
    });
    setIsEditing(false);
  };
  
  // Handle adding a new criteria
  const addCriteria = () => {
    if (!newCriteriaName) return;
    
    setScoringCriteria([
      ...scoringCriteria,
      {
        id: Date.now().toString(),
        name: newCriteriaName,
        description: newCriteriaDescription,
        weight: newCriteriaWeight,
        enabled: true
      }
    ]);
    
    // Reset form
    setNewCriteriaName('');
    setNewCriteriaDescription('');
    setNewCriteriaWeight(10);
  };
  
  // Handle removing a criteria
  const removeCriteria = (id: string) => {
    setScoringCriteria(scoringCriteria.filter(criteria => criteria.id !== id));
  };
  
  // Update criteria weight
  const updateCriteriaWeight = (id: string, weight: number) => {
    setScoringCriteria(scoringCriteria.map(criteria => 
      criteria.id === id ? { ...criteria, weight } : criteria
    ));
  };
  
  // Toggle criteria enabled/disabled
  const toggleCriteria = (id: string) => {
    setScoringCriteria(scoringCriteria.map(criteria => 
      criteria.id === id ? { ...criteria, enabled: !criteria.enabled } : criteria
    ));
  };
  
  // Determine if we should show a warning about the total weight
  const showWeightWarning = totalWeight !== 100 && isEditing;
  
  // Calculate a simulated score based on current criteria and sample data
  const calculateSimulatedScore = () => {
    let score = 0;
    
    // Get only enabled criteria
    const enabledCriteria = scoringCriteria.filter(c => c.enabled);
    
    // Normalize weights to 100% if needed
    const weightSum = enabledCriteria.reduce((sum, c) => sum + c.weight, 0);
    const weightFactor = weightSum > 0 ? 100 / weightSum : 0;
    
    // Calculate score components based on simulation data
    enabledCriteria.forEach(criteria => {
      const normalizedWeight = criteria.weight * weightFactor / 100;
      
      // Calculate component score based on criteria type
      let componentScore = 0;
      
      switch(criteria.id) {
        case '1': // Historique de remboursement
          switch(simulationData.sfdHistory) {
            case 'excellent': componentScore = 100; break;
            case 'good': componentScore = 80; break;
            case 'fair': componentScore = 60; break;
            case 'poor': componentScore = 30; break;
            default: componentScore = 0;
          }
          break;
          
        case '2': // Montant demandé
          // Lower amount = higher score (hypothetical inverse relationship)
          componentScore = Math.max(0, 100 - (simulationData.requestAmount / 100000));
          break;
          
        case '3': // Ancienneté de la SFD
          // More years = higher score (max at 10 years)
          componentScore = Math.min(100, simulationData.sfdAge * 10);
          break;
          
        case '4': // Santé financière
          switch(simulationData.financialHealth) {
            case 'excellent': componentScore = 100; break;
            case 'good': componentScore = 80; break;
            case 'fair': componentScore = 50; break;
            case 'poor': componentScore = 20; break;
            default: componentScore = 0;
          }
          break;
          
        case '5': // Diversification du portefeuille
          switch(simulationData.portfolioDiversity) {
            case 'high': componentScore = 100; break;
            case 'medium': componentScore = 70; break;
            case 'low': componentScore = 40; break;
            default: componentScore = 0;
          }
          break;
          
        default:
          // For custom criteria, default to a moderate score
          componentScore = 60;
      }
      
      score += componentScore * normalizedWeight;
    });
    
    return Math.round(score);
  };
  
  const simulatedScore = calculateSimulatedScore();
  
  // Get the qualitative rating based on score
  const getScoreRating = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "text-green-700" };
    if (score >= 70) return { text: "Bon", color: "text-blue-700" };
    if (score >= 60) return { text: "Moyen", color: "text-amber-700" };
    if (score >= 50) return { text: "Passable", color: "text-orange-700" };
    return { text: "Risqué", color: "text-red-700" };
  };
  
  const scoreRating = getScoreRating(simulatedScore);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Système de Scoring de Crédit
              </CardTitle>
              <CardDescription>
                Configurez les critères utilisés pour l'évaluation automatique des demandes de crédit
              </CardDescription>
            </div>
            <div>
              {isEditing ? (
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="mr-2">
                  Annuler
                </Button>
              ) : null}
              <Button 
                onClick={isEditing ? saveConfiguration : () => setIsEditing(true)}
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
          <Tabs defaultValue="criteria">
            <TabsList className="mb-4">
              <TabsTrigger value="criteria" className="flex items-center">
                <ListFilter className="h-4 w-4 mr-1" />
                Critères
              </TabsTrigger>
              <TabsTrigger value="simulation" className="flex items-center">
                <BarChart4 className="h-4 w-4 mr-1" />
                Simulation
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-1" />
                Historique
              </TabsTrigger>
            </TabsList>
            
            {/* Criteria Tab */}
            <TabsContent value="criteria">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={isAutomaticScoringEnabled}
                      onCheckedChange={setIsAutomaticScoringEnabled}
                      disabled={!isEditing}
                      id="auto-scoring"
                    />
                    <Label htmlFor="auto-scoring" className="font-medium">
                      Scoring automatique activé
                    </Label>
                  </div>
                  
                  {showWeightWarning && (
                    <div className="flex items-center text-amber-600 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      La somme des pondérations devrait être 100% (actuellement {totalWeight}%)
                    </div>
                  )}
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Actif</TableHead>
                      <TableHead>Critère</TableHead>
                      <TableHead className="w-[200px]">Pondération (%)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scoringCriteria.map(criteria => (
                      <TableRow key={criteria.id}>
                        <TableCell>
                          <Switch 
                            checked={criteria.enabled}
                            onCheckedChange={() => toggleCriteria(criteria.id)}
                            disabled={!isEditing}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{criteria.name}</p>
                            <p className="text-sm text-muted-foreground">{criteria.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{criteria.weight}%</span>
                            </div>
                            {isEditing ? (
                              <Slider
                                value={[criteria.weight]}
                                min={5}
                                max={50}
                                step={5}
                                disabled={!criteria.enabled}
                                onValueChange={(values) => updateCriteriaWeight(criteria.id, values[0])}
                              />
                            ) : (
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#0D6A51]" 
                                  style={{ width: `${criteria.weight * 2}%` }}  // 50 is max so * 2 for percentage
                                ></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={scoringCriteria.length <= 3}
                              onClick={() => removeCriteria(criteria.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {isEditing && (
                  <div className="border rounded-md p-4 mt-6">
                    <h3 className="text-sm font-medium mb-3">Ajouter un nouveau critère</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="criteria-name">Nom du critère</Label>
                        <Input
                          id="criteria-name"
                          value={newCriteriaName}
                          onChange={(e) => setNewCriteriaName(e.target.value)}
                          placeholder="Ex: Garanties proposées"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="criteria-weight">Pondération (%)</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setNewCriteriaWeight(Math.max(5, newCriteriaWeight - 5))}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Input
                            id="criteria-weight"
                            type="number"
                            min={5}
                            max={50}
                            value={newCriteriaWeight}
                            onChange={(e) => setNewCriteriaWeight(parseInt(e.target.value) || 10)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setNewCriteriaWeight(Math.min(50, newCriteriaWeight + 5))}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="criteria-description">Description</Label>
                      <Input
                        id="criteria-description"
                        value={newCriteriaDescription}
                        onChange={(e) => setNewCriteriaDescription(e.target.value)}
                        placeholder="Description du critère et comment il est évalué"
                      />
                    </div>
                    
                    <Button 
                      onClick={addCriteria}
                      disabled={!newCriteriaName}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Ajouter le critère
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Simulation Tab */}
            <TabsContent value="simulation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="text-sm font-medium">Paramètres de la simulation</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Historique de remboursement</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={simulationData.sfdHistory}
                        onChange={(e) => setSimulationData({...simulationData, sfdHistory: e.target.value})}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Bon</option>
                        <option value="fair">Moyen</option>
                        <option value="poor">Faible</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Montant demandé (FCFA)</Label>
                      <Input 
                        type="number" 
                        value={simulationData.requestAmount}
                        onChange={(e) => setSimulationData({...simulationData, requestAmount: parseInt(e.target.value) || 0})}
                        min={100000}
                        max={50000000}
                        step={100000}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ancienneté de la SFD (années)</Label>
                      <Input 
                        type="number" 
                        value={simulationData.sfdAge}
                        onChange={(e) => setSimulationData({...simulationData, sfdAge: parseInt(e.target.value) || 0})}
                        min={1}
                        max={20}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Santé financière</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={simulationData.financialHealth}
                        onChange={(e) => setSimulationData({...simulationData, financialHealth: e.target.value})}
                      >
                        <option value="excellent">Excellente</option>
                        <option value="good">Bonne</option>
                        <option value="fair">Moyenne</option>
                        <option value="poor">Faible</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Diversification du portefeuille</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={simulationData.portfolioDiversity}
                        onChange={(e) => setSimulationData({...simulationData, portfolioDiversity: e.target.value})}
                      >
                        <option value="high">Élevée</option>
                        <option value="medium">Moyenne</option>
                        <option value="low">Faible</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="border rounded-lg p-6 h-full flex flex-col">
                    <h3 className="text-sm font-medium mb-4">Résultat de la simulation</h3>
                    
                    <div className="text-center flex-1 flex flex-col items-center justify-center">
                      <div className="relative w-56 h-56">
                        <div className="absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className={`text-7xl font-bold ${scoreRating.color}`}>
                            {simulatedScore}
                          </div>
                        </div>
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-transparent" 
                          style={{
                            borderTopColor: simulatedScore >= 25 ? '#0D6A51' : '#e5e7eb',
                            borderRightColor: simulatedScore >= 50 ? '#0D6A51' : '#e5e7eb',
                            borderBottomColor: simulatedScore >= 75 ? '#0D6A51' : '#e5e7eb',
                            borderLeftColor: simulatedScore >= 100 ? '#0D6A51' : '#e5e7eb',
                            transform: 'rotate(-45deg)'
                          }}
                        ></div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-lg font-medium">Évaluation: <span className={scoreRating.color}>{scoreRating.text}</span></h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Score basé sur les critères de pondération actuels
                        </p>
                        
                        <div className="mt-4 flex items-center">
                          <Star className="h-5 w-5 text-amber-500 mr-1" />
                          {simulatedScore >= 70 ? (
                            <span className="text-green-600">Recommandation: Approuver</span>
                          ) : simulatedScore >= 50 ? (
                            <span className="text-amber-600">Recommandation: Examen approfondi</span>
                          ) : (
                            <span className="text-red-600">Recommandation: Rejeter</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history">
              <div className="py-8 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Historique des modifications</h3>
                <p className="mt-2 text-muted-foreground">
                  L'historique des modifications du système de scoring sera affiché ici
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
