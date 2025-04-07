import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText, Image, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CollateralManagement = () => {
  const { toast } = useToast();
  
  const [openDialog, setOpenDialog] = React.useState(false);
  const [collaterals, setCollaterals] = React.useState([
    {
      id: 1,
      type: 'Terrain',
      description: 'Terrain de 5 hectares à Yopougon',
      estimatedValue: 7500000,
      documents: ['Titre foncier', 'Evaluation agrée'],
      images: ['/images/terrain1.jpg', '/images/terrain2.jpg']
    },
    {
      id: 2,
      type: 'Véhicule',
      description: 'Camion Renault Midlum 180',
      estimatedValue: 4200000,
      documents: ['Carte grise', 'Facture d\'achat'],
      images: ['/images/camion1.jpg', '/images/camion2.jpg']
    },
  ]);
  
  const handleAddCollateral = (newCollateral) => {
    setCollaterals([...collaterals, { ...newCollateral, id: collaterals.length + 1 }]);
    setOpenDialog(false);
    toast({
      title: "Garantie ajoutée",
      description: "La nouvelle garantie a été ajoutée avec succès.",
    });
  };
  
  const handleEditCollateral = (id, updatedCollateral) => {
    setCollaterals(collaterals.map(collateral =>
      collateral.id === id ? { ...collateral, ...updatedCollateral } : collateral
    ));
    toast({
      title: "Garantie modifiée",
      description: "La garantie a été modifiée avec succès.",
    });
  };
  
  const handleDeleteCollateral = (id) => {
    setCollaterals(collaterals.filter(collateral => collateral.id !== id));
    toast({
      title: "Garantie supprimée",
      description: "La garantie a été supprimée avec succès.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Gestion des Garanties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current-collaterals">
          <TabsList className="mb-4">
            <TabsTrigger value="current-collaterals">
              Garanties actuelles
            </TabsTrigger>
            <TabsTrigger value="add-collateral">
              Ajouter une garantie
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current-collaterals">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Valeur estimée</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaterals.map((collateral) => (
                  <TableRow key={collateral.id}>
                    <TableCell className="font-medium">{collateral.type}</TableCell>
                    <TableCell>{collateral.description}</TableCell>
                    <TableCell>{collateral.estimatedValue.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCollateral(collateral.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="add-collateral">
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-medium">Ajouter une nouvelle garantie</h3>
                    <p className="text-xs text-muted-foreground">
                      Renseignez les informations de la garantie
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une garantie
              </Button>
              
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Nouvelle garantie</DialogTitle>
                    <DialogDescription>
                      Ajouter les informations de la garantie
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Input id="type" defaultValue="Terrain" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input id="description" defaultValue="Terrain de 5 hectares à Yopougon" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="value" className="text-right">
                        Valeur estimée
                      </Label>
                      <Input id="value" defaultValue="7500000" className="col-span-3" />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={() => handleAddCollateral({
                      type: 'Terrain',
                      description: 'Terrain de 5 hectares à Yopougon',
                      estimatedValue: 7500000,
                      documents: ['Titre foncier', 'Evaluation agrée'],
                      images: ['/images/terrain1.jpg', '/images/terrain2.jpg']
                    })}>
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
