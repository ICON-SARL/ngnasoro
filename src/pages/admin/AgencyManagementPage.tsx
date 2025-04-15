
import React from 'react';
import { useCurrentSfd } from '@/hooks/useCurrentSfd';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Loader2, Users, CreditCard, FileText, Settings, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdStats } from '@/hooks/useSfdStats';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';

// Define a type for the SFD settings structure
interface SfdSettings {
  loan_settings?: {
    max_loan_amount?: number;
    min_loan_amount?: number;
    default_interest_rate?: number;
    late_payment_fee?: number;
  };
  security_settings?: {
    password_expiry_days?: number;
    session_timeout_minutes?: number;
    ip_whitelist?: string[];
  };
  transaction_settings?: {
    daily_withdrawal_limit?: number;
    requires_2fa?: boolean;
    notification_enabled?: boolean;
  };
}

// Extend the Sfd type to include the settings property
interface ExtendedSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  logo_url?: string | null;
  contact_email?: string;
  phone?: string;
  legal_document_url?: string | null;
  description?: string;
  created_at: string;
  updated_at?: string;
  settings?: SfdSettings;
}

export default function AgencyManagementPage() {
  const { data: sfd, isLoading: sfdLoading } = useCurrentSfd();
  const { data: stats, isLoading: statsLoading } = useSfdStats(sfd?.id);
  const { user, userRole } = useAuth();
  const isLoading = sfdLoading || statsLoading;

  console.log("AgencyManagementPage - User:", user?.id);
  console.log("AgencyManagementPage - User role:", userRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <span>Chargement des données SFD...</span>
      </div>
    );
  }

  if (!sfd) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">Aucune SFD associée</h1>
          <p className="mt-2">
            Votre compte n'est pas encore associé à une SFD. Veuillez contacter l'administrateur système.
          </p>
        </div>
      </div>
    );
  }

  // Cast the sfd to our extended type with properly typed settings
  const typedSfd = sfd as unknown as ExtendedSfd;
  const settings = typedSfd.settings || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion de {typedSfd.name}</h1>
          <p className="text-muted-foreground">
            Configuration et paramètres de votre SFD
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Crédits Approuvés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.approvedCreditsCount || 0}</div>
              <div className="flex items-center text-xs text-green-500 mt-2">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+{stats?.approvedCreditsAmount?.toLocaleString() || 0} FCFA ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clients Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeClientsCount || 0}</div>
              <div className="flex items-center text-xs text-green-500 mt-2">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>{stats?.pendingClientsCount || 0} en attente</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde Subventions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.subsidyBalance?.toLocaleString() || 0} FCFA</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <FileText className="h-4 w-4 mr-1" />
                <span>Balance courante</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="admins">Administrateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la SFD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Nom</p>
                  <p className="text-muted-foreground">{typedSfd.name}</p>
                </div>
                <div>
                  <p className="font-medium">Code</p>
                  <p className="text-muted-foreground">{typedSfd.code}</p>
                </div>
                {typedSfd.region && (
                  <div>
                    <p className="font-medium">Région</p>
                    <p className="text-muted-foreground">{typedSfd.region}</p>
                  </div>
                )}
                {typedSfd.contact_email && (
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{typedSfd.contact_email}</p>
                  </div>
                )}
                {typedSfd.phone && (
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-muted-foreground">{typedSfd.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <SfdDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la SFD</CardTitle>
                <CardDescription>
                  Configuration des paramètres opérationnels de votre SFD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Settings from sfd.settings */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Paramètres des prêts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Montant maximum du prêt</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.loan_settings?.max_loan_amount?.toLocaleString() || 0} FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Montant minimum du prêt</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.loan_settings?.min_loan_amount?.toLocaleString() || 0} FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Taux d'intérêt par défaut</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.loan_settings?.default_interest_rate || 0}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Paramètres de sécurité</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Expiration du mot de passe</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.security_settings?.password_expiry_days || 90} jours
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Timeout de session</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.security_settings?.session_timeout_minutes || 30} minutes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Administrateurs de la SFD</CardTitle>
                <CardDescription>
                  Gérez les administrateurs qui ont accès à votre SFD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>La gestion des administrateurs sera disponible prochainement.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
