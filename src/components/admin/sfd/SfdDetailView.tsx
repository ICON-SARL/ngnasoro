
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, UserPlus, AlertTriangle, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sfd } from '../types/sfd-types';
import { formatDate } from '@/utils/formatDate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdAdminList } from './SfdAdminList';
import { AddSfdAdminDialog } from './AddSfdAdminDialog';

interface SfdDetailViewProps {
  sfd: Sfd;
  onBack: () => void;
  onAddAdmin?: () => void;
}

export function SfdDetailView({ sfd, onBack, onAddAdmin }: SfdDetailViewProps) {
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{sfd.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">ID: {sfd.id}</p>
              </div>
              <Badge 
                className={
                  sfd.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : sfd.status === 'suspended'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {sfd.status === 'active' 
                  ? 'Active' 
                  : sfd.status === 'suspended'
                  ? 'Suspendue'
                  : 'En attente'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Adresse</h3>
                  <p className="mt-1">{sfd.address || 'Non renseignée'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                  <p className="mt-1">{sfd.phone || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="mt-1">{sfd.email || 'Non renseigné'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{sfd.description || 'Aucune description'}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date de création</h3>
                  <p className="mt-1">{sfd.created_at ? formatDate(sfd.created_at) : 'Inconnue'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                  <p className="mt-1">{sfd.updated_at ? formatDate(sfd.updated_at) : 'Inconnue'}</p>
                </div>
              </div>
              
              {sfd.status === 'suspended' && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">SFD suspendue</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Cette SFD a été suspendue le {sfd.suspended_at ? formatDate(sfd.suspended_at) : 'date inconnue'}.
                      {sfd.suspension_reason && (
                        <span> Raison: {sfd.suspension_reason}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nombre de clients</h3>
                <p className="text-2xl font-bold mt-1">{sfd.client_count || 0}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nombre de prêts</h3>
                <p className="text-2xl font-bold mt-1">{sfd.loan_count || 0}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Volume total des prêts</h3>
                <p className="text-2xl font-bold mt-1">
                  {sfd.total_loan_amount 
                    ? `${sfd.total_loan_amount.toLocaleString()} FCFA` 
                    : '0 FCFA'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Administrateurs</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold mt-1">{sfd.admin_count || 0}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddAdminDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                {(!sfd.admin_count || sfd.admin_count === 0) && (
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mt-2">
                    <p className="text-sm text-yellow-700 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Aucun administrateur configuré
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dernière connexion admin</h3>
                <p className="mt-1">
                  {sfd.last_admin_login 
                    ? formatDate(sfd.last_admin_login) 
                    : 'Jamais'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="admins" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="admins" className="flex-1">Administrateurs SFD</TabsTrigger>
              <TabsTrigger value="clients" className="flex-1">Clients</TabsTrigger>
              <TabsTrigger value="loans" className="flex-1">Prêts</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="admins">
                <SfdAdminList 
                  sfdId={sfd.id} 
                  sfdName={sfd.name} 
                  onAddAdmin={() => setShowAddAdminDialog(true)} 
                />
              </TabsContent>
              <TabsContent value="clients">
                <div className="p-8 text-center text-muted-foreground">
                  Liste des clients associés à cette SFD
                </div>
              </TabsContent>
              <TabsContent value="loans">
                <div className="p-8 text-center text-muted-foreground">
                  Liste des prêts associés à cette SFD
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <AddSfdAdminDialog
        open={showAddAdminDialog}
        onOpenChange={setShowAddAdminDialog}
        sfdId={sfd.id}
        sfdName={sfd.name}
        onAddAdmin={() => {
          setShowAddAdminDialog(false);
        }}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
