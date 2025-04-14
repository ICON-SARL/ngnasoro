import React, { useState } from 'react';
import { SfdSubsidy } from '@/hooks/sfd/types';
import { useSubsidies } from '@/hooks/useSubsidies';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  CircleDollarSign, 
  Building,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Calendar
} from 'lucide-react';
import { useSubsidies } from '@/hooks/useSubsidies';
import { SfdSubsidy } from '@/types/sfdClients';
import { Progress } from '@/components/ui/progress';
import { DatePicker } from '@/components/ui/date-picker';

export function SubsidyManagement() {
  const [isNewSubsidyDialogOpen, setIsNewSubsidyDialogOpen] = useState(false);
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const [newSubsidyData, setNewSubsidyData] = useState({
    amount: 0,
    description: '',
    endDate: null as Date | null
  });
  
  const { 
    subsidies, 
    sfds,
    isLoading, 
    createSubsidy 
  } = useSubsidies();
  
  const handleCreateSubsidy = async () => {
    if (!selectedSfdId) {
      return;
    }
    
    try {
      await createSubsidy.mutateAsync({
        sfd_id: selectedSfdId,
        amount: newSubsidyData.amount,
        description: newSubsidyData.description,
        end_date: newSubsidyData.endDate ? newSubsidyData.endDate.toISOString() : undefined
      });
      
      setIsNewSubsidyDialogOpen(false);
      setSelectedSfdId(null);
      setNewSubsidyData({
        amount: 0,
        description: '',
        endDate: null
      });
    } catch (error) {
      console.error("Error creating subsidy:", error);
    }
  };
  
  const getSfdName = (sfdId: string): string => {
    const sfd = sfds.find(s => s.id === sfdId);
    return sfd ? sfd.name : 'SFD inconnu';
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800">Révoquée</Badge>;
      case 'depleted':
        return <Badge className="bg-blue-100 text-blue-800">Épuisée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  const calculateUtilizationPercentage = (subsidy: SfdSubsidy) => {
    if (subsidy.amount === 0) return 0;
    return Math.round((subsidy.used_amount / subsidy.amount) * 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Subventions MEREF</h2>
          <p className="text-sm text-muted-foreground">
            Gérez l'allocation des fonds de subvention aux SFDs
          </p>
        </div>
        
        <Button onClick={() => setIsNewSubsidyDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Nouvelle Subvention
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Subventions Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {subsidies.filter(s => s.status === 'active').length}
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Montant Total Alloué
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {subsidies.reduce((sum, subsidy) => sum + subsidy.amount, 0).toLocaleString()} FCFA
              </div>
              <div className="p-2 bg-[#0D6A51]/10 rounded-full">
                <CircleDollarSign className="h-5 w-5 text-[#0D6A51]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Montant Utilisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {subsidies.reduce((sum, subsidy) => sum + subsidy.used_amount, 0).toLocaleString()} FCFA
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des Subventions</CardTitle>
          <CardDescription>
            Suivez les allocations de subventions du MEREF aux institutions SFD partenaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-pulse" />
              <p>Chargement des données...</p>
            </div>
          ) : subsidies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p>Aucune subvention trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SFD</TableHead>
                  <TableHead>Montant Alloué</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Date d'allocation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subsidies.map((subsidy) => (
                  <TableRow key={subsidy.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                          <Building className="h-4 w-4" />
                        </div>
                        {getSfdName(subsidy.sfd_id)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{subsidy.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{subsidy.used_amount.toLocaleString()} FCFA</span>
                          <span>{calculateUtilizationPercentage(subsidy)}%</span>
                        </div>
                        <Progress value={calculateUtilizationPercentage(subsidy)} />
                      </div>
                    </TableCell>
                    <TableCell>{new Date(subsidy.allocated_at).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(subsidy.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Détails de la Subvention</DialogTitle>
                            <DialogDescription>
                              Informations détaillées sur l'allocation de fonds
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-lg">{getSfdName(subsidy.sfd_id)}</h3>
                              {getStatusBadge(subsidy.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Montant alloué</p>
                                <p className="font-medium">{subsidy.amount.toLocaleString()} FCFA</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Montant utilisé</p>
                                <p className="font-medium">{subsidy.used_amount.toLocaleString()} FCFA</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Montant restant</p>
                                <p className="font-medium">{subsidy.remaining_amount.toLocaleString()} FCFA</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Date d'allocation</p>
                                <p className="font-medium">{new Date(subsidy.allocated_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            {subsidy.end_date && (
                              <div>
                                <p className="text-sm text-muted-foreground">Date d'expiration</p>
                                <p className="font-medium">{new Date(subsidy.end_date).toLocaleDateString()}</p>
                              </div>
                            )}
                            
                            {subsidy.description && (
                              <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="text-sm">{subsidy.description}</p>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Taux d'utilisation</p>
                              <Progress value={calculateUtilizationPercentage(subsidy)} />
                              <p className="text-sm text-right">{calculateUtilizationPercentage(subsidy)}%</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* New Subsidy Dialog */}
      <Dialog open={isNewSubsidyDialogOpen} onOpenChange={setIsNewSubsidyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Allouer une nouvelle subvention</DialogTitle>
            <DialogDescription>
              Fournissez les détails de la nouvelle allocation de subvention MEREF
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Institution SFD</label>
              <Select 
                onValueChange={(value) => setSelectedSfdId(value)}
                value={selectedSfdId || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une SFD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Institutions SFD</SelectLabel>
                    {sfds.map((sfd) => (
                      <SelectItem key={sfd.id} value={sfd.id}>
                        {sfd.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Montant (FCFA)</label>
              <div className="relative">
                <CircleDollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-8"
                  value={newSubsidyData.amount}
                  onChange={(e) => setNewSubsidyData({
                    ...newSubsidyData,
                    amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Date d'expiration (optionnel)</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-8"
                  onChange={(e) => setNewSubsidyData({
                    ...newSubsidyData,
                    endDate: e.target.value ? new Date(e.target.value) : null
                  })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newSubsidyData.description}
                onChange={(e) => setNewSubsidyData({
                  ...newSubsidyData,
                  description: e.target.value
                })}
                placeholder="Détails sur l'objectif de cette subvention..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSubsidyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSubsidy}>
              Allouer la subvention
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
