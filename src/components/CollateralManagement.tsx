import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Trash2, Plus, CheckCircle, FileInput, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CollateralManagement = () => {
  const { toast } = useToast();
  const [collaterals, setCollaterals] = useState([
    {
      id: 1,
      type: 'Titre foncier',
      reference: 'TF-25478-CI',
      value: 3500000,
      status: 'verified',
      uploadDate: '15/03/2023',
      documents: 2
    },
    {
      id: 2,
      type: 'Véhicule',
      reference: 'VEH-9217-ABJ',
      value: 1200000,
      status: 'pending',
      uploadDate: '20/03/2023',
      documents: 1
    },
    {
      id: 3,
      type: 'Dépôt à terme',
      reference: 'DAT-3245-SGCI',
      value: 500000,
      status: 'verified',
      uploadDate: '18/03/2023',
      documents: 3
    },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setIsDialogOpen(false);
      
      const newCollateral = {
        id: collaterals.length + 1,
        type: 'Équipement professionnel',
        reference: `EQP-${Math.floor(1000 + Math.random() * 9000)}`,
        value: 750000,
        status: 'pending',
        uploadDate: new Date().toLocaleDateString('fr-FR'),
        documents: 1
      };
      
      setCollaterals([...collaterals, newCollateral]);
      
      toast({
        title: "Garantie ajoutée",
        description: "La garantie a été ajoutée avec succès et est en attente de vérification.",
      });
    }, 2000);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Vérifié</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <FileInput className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Gestion des Garanties
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une garantie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle garantie</DialogTitle>
              <DialogDescription>
                Téléchargez les documents relatifs à la garantie pour le dossier de prêt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collateral-type">Type de garantie</Label>
                  <Select>
                    <SelectTrigger id="collateral-type">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property">Titre foncier</SelectItem>
                      <SelectItem value="vehicle">Véhicule</SelectItem>
                      <SelectItem value="equipment">Équipement professionnel</SelectItem>
                      <SelectItem value="deposit">Dépôt à terme</SelectItem>
                      <SelectItem value="insurance">Police d'assurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collateral-value">Valeur estimée</Label>
                  <Input id="collateral-value" placeholder="Ex: 1,000,000" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collateral-reference">Référence du document</Label>
                <Input id="collateral-reference" placeholder="Ex: TF-12345-CI" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collateral-description">Description</Label>
                <Input id="collateral-description" placeholder="Description brève de la garantie" />
              </div>
              
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Glissez-déposez vos fichiers ici, ou
                </p>
                <Button variant="outline" size="sm">
                  Parcourir les fichiers
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Formats acceptés: PDF, JPG, PNG (Max: 10MB)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Téléchargement..." : "Télécharger et soumettre"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaterals.map((collateral) => (
              <TableRow key={collateral.id}>
                <TableCell>{collateral.type}</TableCell>
                <TableCell>{collateral.reference}</TableCell>
                <TableCell>{collateral.value.toLocaleString()} FCFA</TableCell>
                <TableCell>{getStatusBadge(collateral.status)}</TableCell>
                <TableCell>{collateral.uploadDate}</TableCell>
                <TableCell>
                  <Badge variant="outline">{collateral.documents} fichier(s)</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-2">Informations sur les garanties</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span>Valeur totale des garanties:</span>
              <span className="font-bold">{collaterals.reduce((sum, item) => sum + item.value, 0).toLocaleString()} FCFA</span>
            </p>
            <p className="flex justify-between">
              <span>Ratio garantie/crédit:</span>
              <span className="font-bold">148%</span>
            </p>
            <p className="flex justify-between">
              <span>Garanties vérifiées:</span>
              <span className="font-bold">{collaterals.filter(c => c.status === 'verified').length} sur {collaterals.length}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
