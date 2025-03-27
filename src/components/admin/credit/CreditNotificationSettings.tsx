
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Save, RefreshCw, Check, AlertTriangle } from 'lucide-react';

export const CreditNotificationSettings = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Notification settings
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  
  // Template content
  const [templates, setTemplates] = useState({
    approvalEmailSubject: "Votre demande de crédit a été approuvée",
    approvalEmailBody: "Cher·e {sfd_name},\n\nNous avons le plaisir de vous informer que votre demande de crédit (Réf: {reference}) a été approuvée.\n\nMontant approuvé: {amount} FCFA\n\nVeuillez vous connecter à votre espace pour plus de détails.\n\nCordialement,\nL'équipe NGNA SÔRÔ!",
    
    rejectionEmailSubject: "Décision concernant votre demande de crédit",
    rejectionEmailBody: "Cher·e {sfd_name},\n\nNous vous informons que votre demande de crédit (Réf: {reference}) n'a pas pu être approuvée pour la raison suivante:\n\n{rejection_reason}\n\n{additional_comments}\n\nSi vous avez des questions, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe NGNA SÔRÔ!",
    
    approvalSmsTemplate: "NGNA SÔRÔ!: Votre demande de crédit (Réf: {reference}) a été approuvée. Montant: {amount} FCFA. Connectez-vous pour plus de détails.",
    rejectionSmsTemplate: "NGNA SÔRÔ!: Votre demande de crédit (Réf: {reference}) n'a pas été approuvée. Raison: {rejection_reason}. Pour plus d'informations, consultez votre email."
  });
  
  // Test message state
  const [testRecipient, setTestRecipient] = useState("");
  const [testSending, setTestSending] = useState(false);
  
  const handleTemplateChange = (name: keyof typeof templates, value: string) => {
    setTemplates(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSettings = () => {
    // Here would be logic to save to backend
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres de notification ont été mis à jour",
    });
    setIsEditing(false);
  };
  
  const sendTestMessage = (type: 'email' | 'sms') => {
    setTestSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setTestSending(false);
      
      toast({
        title: type === 'email' ? "Email de test envoyé" : "SMS de test envoyé",
        description: `Le message de test a été envoyé à ${testRecipient}`,
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Paramètres de Notification
              </CardTitle>
              <CardDescription>
                Configurez comment les SFDs sont notifiées des décisions concernant leurs demandes
              </CardDescription>
            </div>
            <div>
              {isEditing ? (
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="mr-2">
                  Annuler
                </Button>
              ) : null}
              <Button 
                onClick={isEditing ? saveSettings : () => setIsEditing(true)}
                variant={isEditing ? "default" : "outline"}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </>
                ) : (
                  "Modifier les paramètres"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex space-x-8">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="email-notifications" 
                  checked={emailEnabled} 
                  onCheckedChange={setEmailEnabled}
                  disabled={!isEditing}
                />
                <Label htmlFor="email-notifications" className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Notifications par Email
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="sms-notifications" 
                  checked={smsEnabled} 
                  onCheckedChange={setSmsEnabled}
                  disabled={!isEditing}
                />
                <Label htmlFor="sms-notifications" className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Notifications par SMS
                </Label>
              </div>
            </div>
            
            <Tabs defaultValue="approval">
              <TabsList>
                <TabsTrigger value="approval" className="flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Approbation
                </TabsTrigger>
                <TabsTrigger value="rejection" className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Rejet
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Test
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="approval" className="space-y-6 pt-4">
                {emailEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Template d'Email d'Approbation</h3>
                    
                    <div className="space-y-2">
                      <Label>Sujet</Label>
                      <Input 
                        value={templates.approvalEmailSubject}
                        onChange={(e) => handleTemplateChange('approvalEmailSubject', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Contenu</Label>
                      <Textarea 
                        value={templates.approvalEmailBody}
                        onChange={(e) => handleTemplateChange('approvalEmailBody', e.target.value)}
                        rows={6}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                )}
                
                {smsEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Template de SMS d'Approbation</h3>
                    
                    <div className="space-y-2">
                      <Label>Contenu</Label>
                      <Textarea 
                        value={templates.approvalSmsTemplate}
                        onChange={(e) => handleTemplateChange('approvalSmsTemplate', e.target.value)}
                        rows={3}
                        disabled={!isEditing}
                      />
                      <p className="text-xs text-gray-500">
                        Limite: 160 caractères pour un SMS standard. Actuel: {templates.approvalSmsTemplate.length}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Variables disponibles</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><code>{"{sfd_name}"}</code>: Nom de la SFD</div>
                    <div><code>{"{reference}"}</code>: Référence de la demande</div>
                    <div><code>{"{amount}"}</code>: Montant approuvé</div>
                    <div><code>{"{date}"}</code>: Date d'approbation</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rejection" className="space-y-6 pt-4">
                {emailEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Template d'Email de Rejet</h3>
                    
                    <div className="space-y-2">
                      <Label>Sujet</Label>
                      <Input 
                        value={templates.rejectionEmailSubject}
                        onChange={(e) => handleTemplateChange('rejectionEmailSubject', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Contenu</Label>
                      <Textarea 
                        value={templates.rejectionEmailBody}
                        onChange={(e) => handleTemplateChange('rejectionEmailBody', e.target.value)}
                        rows={6}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                )}
                
                {smsEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Template de SMS de Rejet</h3>
                    
                    <div className="space-y-2">
                      <Label>Contenu</Label>
                      <Textarea 
                        value={templates.rejectionSmsTemplate}
                        onChange={(e) => handleTemplateChange('rejectionSmsTemplate', e.target.value)}
                        rows={3}
                        disabled={!isEditing}
                      />
                      <p className="text-xs text-gray-500">
                        Limite: 160 caractères pour un SMS standard. Actuel: {templates.rejectionSmsTemplate.length}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Variables disponibles</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><code>{"{sfd_name}"}</code>: Nom de la SFD</div>
                    <div><code>{"{reference}"}</code>: Référence de la demande</div>
                    <div><code>{"{rejection_reason}"}</code>: Motif du rejet</div>
                    <div><code>{"{additional_comments}"}</code>: Commentaires supplémentaires</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="test" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Envoyer un message de test</h3>
                  
                  <div className="space-y-2">
                    <Label>Adresse email ou numéro de téléphone</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        placeholder="Email ou numéro de téléphone"
                        className="flex-1"
                      />
                      
                      <Button 
                        onClick={() => sendTestMessage('email')}
                        disabled={!testRecipient || testSending || !emailEnabled}
                        className="whitespace-nowrap"
                      >
                        {testSending ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-1" />
                        )}
                        Tester Email
                      </Button>
                      
                      <Button 
                        onClick={() => sendTestMessage('sms')}
                        disabled={!testRecipient || testSending || !smsEnabled}
                        className="whitespace-nowrap"
                      >
                        {testSending ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Phone className="h-4 w-4 mr-1" />
                        )}
                        Tester SMS
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Message de test</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Les messages de test utilisent les templates configurés et des données fictives pour simuler un message réel.
                          Des frais peuvent s'appliquer pour l'envoi de SMS.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
