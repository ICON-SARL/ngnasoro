import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { kycService } from '@/services/client/kycService';

interface KycLevel {
  level: number;
  name: string;
  maxLoanAmount: number;
  requiredDocuments: string[];
  description: string;
}

const KYC_LEVELS: KycLevel[] = [
  {
    level: 1,
    name: 'Basique',
    maxLoanAmount: 50000,
    requiredDocuments: ['Informations personnelles'],
    description: 'Accès limité aux services de base',
  },
  {
    level: 2,
    name: 'Intermédiaire',
    maxLoanAmount: 500000,
    requiredDocuments: ['Pièce d\'identité (recto/verso)'],
    description: 'Accès aux prêts jusqu\'à 500K FCFA',
  },
  {
    level: 3,
    name: 'Avancé',
    maxLoanAmount: Infinity,
    requiredDocuments: ['Justificatif de domicile', 'Justificatif de revenu'],
    description: 'Accès complet sans limite de prêt',
  },
];

interface ClientDocument {
  id: string;
  document_type: string;
  status: string;
  verified: boolean;
}

const KycLevelUpgrade = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [clientId, setClientId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchKycData();
    }
  }, [user]);

  const fetchKycData = async () => {
    try {
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id, kyc_level')
        .eq('user_id', user?.id || '')
        .single();

      if (clientError) throw clientError;

      setClientId(client.id);
      setCurrentLevel(client.kyc_level || 1);

      const { data: docs, error: docsError } = await supabase
        .from('client_documents')
        .select('id, document_type, status, verified')
        .eq('client_id', client.id);

      if (docsError) throw docsError;
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!clientId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `kyc-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-documents')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('client_documents')
        .insert([{
          client_id: clientId,
          document_type: documentType as 'identity' | 'proof_of_address' | 'bank_statement' | 'other',
          document_url: publicUrl,
          uploaded_by: user?.id,
          status: 'pending',
          verified: false,
        }]);

      if (insertError) throw insertError;

      toast({
        title: 'Succès',
        description: 'Document téléchargé avec succès',
      });

      // Rafraîchir les données
      await fetchKycData();
      
      // Calculer si le niveau peut être augmenté
      const suggestedLevel = await kycService.calculateSuggestedKYCLevel(clientId);
      if (suggestedLevel > currentLevel) {
        // Mettre à jour automatiquement le niveau
        const success = await kycService.updateKYCLevel(clientId, suggestedLevel as 1 | 2 | 3);
        if (success) {
          toast({
            title: 'Niveau KYC mis à jour !',
            description: `Votre niveau KYC a été augmenté au niveau ${suggestedLevel}`,
          });
          setCurrentLevel(suggestedLevel);
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (docType: string): 'missing' | 'pending' | 'verified' => {
    const doc = documents.find(d => d.document_type === docType);
    if (!doc) return 'missing';
    if (doc.verified) return 'verified';
    return 'pending';
  };

  const canUpgradeToLevel = (targetLevel: number): boolean => {
    if (targetLevel <= currentLevel) return false;

    const requiredDocs = KYC_LEVELS.slice(currentLevel, targetLevel)
      .flatMap(level => level.requiredDocuments);

    return requiredDocs.every(docType => {
      const status = getDocumentStatus(docType.toLowerCase().replace(/\s/g, '_'));
      return status === 'verified';
    });
  };

  const getProgressPercentage = (): number => {
    const totalLevels = KYC_LEVELS.length;
    return (currentLevel / totalLevels) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Niveau KYC Actuel
              </CardTitle>
              <CardDescription>
                Augmentez votre niveau KYC pour accéder à des montants de prêt plus élevés
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Niveau {currentLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progression</span>
                <span className="text-sm text-muted-foreground">
                  {currentLevel} / {KYC_LEVELS.length}
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Limite de prêt actuelle: <strong>
                  {currentLevel === 3 ? 'Illimitée' : `${KYC_LEVELS[currentLevel - 1].maxLoanAmount.toLocaleString()} FCFA`}
                </strong>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {KYC_LEVELS.map((level) => {
          const isCurrentLevel = level.level === currentLevel;
          const isCompleted = level.level < currentLevel;
          const canUpgrade = level.level === currentLevel + 1;

          return (
            <Card key={level.level} className={isCurrentLevel ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Niveau {level.level} - {level.name}
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </div>
                  <Badge variant={isCurrentLevel ? 'default' : isCompleted ? 'secondary' : 'outline'}>
                    {isCompleted ? 'Complété' : isCurrentLevel ? 'Actuel' : 'Verrouillé'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Limite de prêt:</p>
                  <p className="text-2xl font-bold text-primary">
                    {level.maxLoanAmount === Infinity 
                      ? 'Illimité' 
                      : `${level.maxLoanAmount.toLocaleString()} FCFA`
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Documents requis:</p>
                  <div className="space-y-2">
                    {level.requiredDocuments.map((doc, idx) => {
                      const docType = doc.toLowerCase().replace(/\s/g, '_');
                      const status = getDocumentStatus(docType);

                      return (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          {status === 'verified' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : status === 'pending' ? (
                            <Badge variant="outline">En attente</Badge>
                          ) : canUpgrade ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*,.pdf';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleFileUpload(file, docType);
                                };
                                input.click();
                              }}
                              disabled={uploading}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                          ) : (
                            <Badge variant="secondary">Non disponible</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {canUpgrade && canUpgradeToLevel(level.level) && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Tous les documents sont vérifiés ! Votre niveau sera mis à jour automatiquement.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KycLevelUpgrade;
