
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, CalendarClock, RefreshCw, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const RepaymentRescheduling = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  
  const reschedulingRequests = [
    {
      id: 'RSC-2023-001',
      clientName: 'Koné Ibrahim',
      loanRef: 'LN-2023-04587',
      requestType: 'extension',
      originalDate: '05/05/2023',
      proposedDate: '20/05/2023',
      reason: 'Retard de paiement de salaire',
      status: 'approved',
      requestDate: '02/05/2023'
    },
    {
      id: 'RSC-2023-002',
      clientName: 'Diallo Fatoumata',
      loanRef: 'LN-2023-03256',
      requestType: 'restructuration',
      originalDate: 'Multiple',
      proposedDate: 'Nouveau plan',
      reason: 'Difficultés économiques temporaires',
      status: 'pending',
      requestDate: '03/05/2023'
    },
    {
      id: 'RSC-2023-003',
      clientName: 'Coulibaly Seydou',
      loanRef: 'LN-2023-02879',
      requestType: 'extension',
      originalDate: '10/05/2023',
      proposedDate: '25/05/2023',
      reason: 'Problème de santé',
      status: 'rejected',
      requestDate: '01/05/2023'
    }
  ];
  
  const handleReschedulingRequest = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Analyse terminée",
        description: "La demande de reprogrammation a été évaluée et approuvée.",
      });
    }, 2000);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Approuvé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><RefreshCw className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Reprogrammation de Remboursement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="requests">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">
              <RefreshCw className="h-4 w-4 mr-2" />
              Demandes
            </TabsTrigger>
            <TabsTrigger value="new-request">
              <CalendarClock className="h-4 w-4 mr-2" />
              Analyser
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date proposée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date demande</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reschedulingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.clientName}</TableCell>
                    <TableCell>
                      {request.requestType === 'extension' ? (
                        <Badge variant="outline">Extension</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50">Restructuration</Badge>
                      )}
                    </TableCell>
                    <TableCell>{request.proposedDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 p-4 rounded-md bg-blue-50 border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="ml-2">
                  <h3 className="text-sm font-medium text-blue-700">Algorithme d'ajustement</h3>
                  <p className="text-xs text-blue-600 mt-1">
                    Notre système utilise un modèle prédictif pour évaluer l'impact de chaque demande de reprogrammation 
                    sur le risque global du prêt, en prenant en compte l'historique du client et des facteurs externes.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="new-request">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan-ref">Référence du prêt</Label>
                    <Input id="loan-ref" placeholder="Ex: LN-2023-XXXX" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nom du client</Label>
                    <Input id="client-name" placeholder="Ex: Koné Ibrahim" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Type de reprogrammation</Label>
                  <RadioGroup defaultValue="extension">
                    <div className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value="extension" id="extension" />
                      <Label htmlFor="extension" className="font-normal">
                        Extension ponctuelle (report d'échéance)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value="restructuration" id="restructuration" />
                      <Label htmlFor="restructuration" className="font-normal">
                        Restructuration complète du calendrier
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-date">Date d'échéance actuelle</Label>
                    <Input id="current-date" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="proposed-date">Date proposée</Label>
                    <Input id="proposed-date" type="date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Motif de la demande</Label>
                  <Select>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Sélectionnez un motif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary-delay">Retard de paiement de salaire</SelectItem>
                      <SelectItem value="health">Problème de santé</SelectItem>
                      <SelectItem value="economic">Difficultés économiques temporaires</SelectItem>
                      <SelectItem value="natural-disaster">Catastrophe naturelle</SelectItem>
                      <SelectItem value="other">Autre raison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="details">Informations complémentaires</Label>
                  <Textarea id="details" placeholder="Détails supplémentaires sur la demande de reprogrammation..." />
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Simulations de l'impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Montant de l'échéance actuelle:</span>
                    <span className="font-medium">38,736 FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Montant proposé après ajustement:</span>
                    <span className="font-medium">40,128 FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impact sur les intérêts totaux:</span>
                    <span className="font-medium text-amber-600">+12,500 FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nouvelle date de fin de prêt:</span>
                    <span className="font-medium">15/06/2024</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={handleReschedulingRequest}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Analyser et traiter la demande"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
