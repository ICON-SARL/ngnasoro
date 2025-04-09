
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  InfoIcon,
  ClockIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from 'lucide-react';

export const RegulatoryUpdates = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenIcon className="mr-2 h-6 w-6 text-primary" />
            Mises à Jour Réglementaires
          </CardTitle>
          <CardDescription>
            Suivi des nouvelles lois et réglementations financières
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-blue-50 border border-blue-200 mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Nouvelle réglementation en vigueur</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Directive UEMOA 2023-05 sur les taux d'intérêt maximaux pour les microcrédits</p>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                Date d'effet: 1er Janvier 2024
              </Badge>
            </AlertDescription>
          </Alert>
          
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Règlement</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Date d'effet</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Directive UEMOA 2023-05</TableCell>
                  <TableCell>
                    Plafonnement des taux d'intérêt pour microcrédits à 20% par an
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>01/01/2024</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-600">
                      <ArrowDownIcon className="h-4 w-4" />
                      <span>Modéré</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-green-300">En vigueur</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Loi n°2023-42</TableCell>
                  <TableCell>
                    Renforcement des exigences KYC pour l'ouverture de comptes
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>15/03/2024</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-red-600">
                      <ArrowUpIcon className="h-4 w-4" />
                      <span>Élevé</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-green-300">En vigueur</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Circulaire BCEAO 2023-12</TableCell>
                  <TableCell>
                    Nouvelles exigences de reporting pour les opérations de prêt
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>01/07/2024</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-600">
                      <ArrowDownIcon className="h-4 w-4" />
                      <span>Modéré</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">À venir</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Plafonds de prêts actuels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Microcrédits individuels</span>
                    <span className="font-medium">3,000,000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prêts agricoles</span>
                    <span className="font-medium">5,000,000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prêts aux PME</span>
                    <span className="font-medium">10,000,000 FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux d'intérêt maximaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Microcrédits</span>
                    <span className="font-medium">20% par an</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prêts agricoles</span>
                    <span className="font-medium">15% par an</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prêts aux PME</span>
                    <span className="font-medium">18% par an</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
