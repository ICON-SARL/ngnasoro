
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sfd } from '../types/sfd-types';
import { ArrowLeft, Building, Users, CreditCard, User, FileText } from 'lucide-react';
import { SfdAdminManager } from './SfdAdminManager';
import { formatCurrency } from '@/utils/formatters';

interface SfdDetailViewProps {
  sfd: Sfd;
  onBack: () => void;
}

export function SfdDetailView({ sfd, onBack }: SfdDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-2xl font-semibold">Détails de la SFD</h2>
          <Badge variant={sfd.status === 'active' ? 'success' : 'destructive'}>
            {sfd.status === 'active' ? 'Active' : 'Suspendue'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {sfd.logo_url ? (
                <img 
                  src={sfd.logo_url} 
                  alt={`Logo ${sfd.name}`} 
                  className="h-8 w-8 mr-2 rounded-full"
                />
              ) : (
                <Building className="h-8 w-8 mr-2 text-primary" />
              )}
              <span className="text-xl font-bold">{sfd.name}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{sfd.code}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Région</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{sfd.region || "Non spécifié"}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="admins">
        <TabsList className="mb-4">
          <TabsTrigger value="admins">
            <Users className="h-4 w-4 mr-2" />
            Administrateurs
          </TabsTrigger>
          <TabsTrigger value="finances">
            <CreditCard className="h-4 w-4 mr-2" />
            Finances
          </TabsTrigger>
          <TabsTrigger value="clients">
            <User className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          <SfdAdminManager sfdId={sfd.id} sfdName={sfd.name} />
        </TabsContent>
        
        <TabsContent value="finances">
          <Card>
            <CardHeader>
              <CardTitle>Informations financières</CardTitle>
              <CardDescription>
                Aperçu des données financières de la SFD
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Solde des subventions</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(sfd.subsidy_balance || 0)}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Prêts actifs</p>
                <p className="text-2xl font-bold mt-1">
                  {sfd.active_loans || 0}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Taux de remboursement</p>
                <p className="text-2xl font-bold mt-1">
                  {sfd.repayment_rate ? `${sfd.repayment_rate}%` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Liste des clients</CardTitle>
              <CardDescription>
                Clients enregistrés avec cette SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Cette fonctionnalité sera disponible prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents légaux</CardTitle>
              <CardDescription>
                Documents officiels de la SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sfd.legal_document_url ? (
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <a 
                    href={sfd.legal_document_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Document légal
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucun document n'a été téléchargé
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
