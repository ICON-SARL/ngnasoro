import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BellRing, MessageSquare, Phone, AlertTriangle, Send, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LatePaymentAlerts = () => {
  const { toast } = useToast();
  
  const alertsData = [
    {
      id: 1,
      clientName: 'Koné Ibrahim',
      loanRef: 'LN-2023-04587',
      dueDate: '05/05/2023',
      daysLate: 3,
      amount: 38736,
      status: 'first-reminder',
      lastContact: '06/05/2023',
      contactMethod: 'sms'
    },
    {
      id: 2,
      clientName: 'Diallo Fatoumata',
      loanRef: 'LN-2023-03256',
      dueDate: '02/05/2023',
      daysLate: 6,
      amount: 45200,
      status: 'second-reminder',
      lastContact: '05/05/2023',
      contactMethod: 'email'
    },
    {
      id: 3,
      clientName: 'Ouattara Jean',
      loanRef: 'LN-2023-02879',
      dueDate: '30/04/2023',
      daysLate: 8,
      amount: 68500,
      status: 'escalation',
      lastContact: '06/05/2023',
      contactMethod: 'call'
    },
    {
      id: 4,
      clientName: 'Touré Awa',
      loanRef: 'LN-2023-01543',
      dueDate: '25/04/2023',
      daysLate: 13,
      amount: 29800,
      status: 'legal-notice',
      lastContact: '05/05/2023',
      contactMethod: 'letter'
    },
  ];
  
  const templatesData = [
    {
      id: 1,
      name: 'Premier rappel (SMS)',
      type: 'sms',
      triggerDays: 1,
      active: true,
      content: 'Bonjour {{nom}}, votre échéance de {{montant}} FCFA du {{date}} est en retard. Merci de régulariser rapidement votre situation. MEREF-SFD.'
    },
    {
      id: 2,
      name: 'Deuxième rappel (Email)',
      type: 'email',
      triggerDays: 5,
      active: true,
      content: 'Cher(e) {{nom}}, Nous n\'avons toujours pas reçu votre paiement de {{montant}} FCFA dû le {{date}}. Veuillez régler cette somme dès que possible...'
    },
    {
      id: 3,
      name: 'Appel de relance',
      type: 'call',
      triggerDays: 7,
      active: true,
      content: 'Script d\'appel pour le client {{nom}} concernant le retard de paiement de {{montant}} FCFA. Points à aborder: 1) Confirmer la situation, 2) Proposer solutions...'
    },
    {
      id: 4,
      name: 'Avis pré-contentieux',
      type: 'letter',
      triggerDays: 10,
      active: true,
      content: 'AVIS IMPORTANT: Malgré nos relances, votre échéance de {{montant}} FCFA due le {{date}} reste impayée. Sans règlement sous 48h, nous serons contraints...'
    },
  ];
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'first-reminder':
        return <Badge className="bg-blue-100 text-blue-800">Premier rappel</Badge>;
      case 'second-reminder':
        return <Badge className="bg-amber-100 text-amber-800">Deuxième rappel</Badge>;
      case 'escalation':
        return <Badge className="bg-orange-100 text-orange-800">Escalade</Badge>;
      case 'legal-notice':
        return <Badge className="bg-red-100 text-red-800">Mise en demeure</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getContactMethodIcon = (method) => {
    switch (method) {
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Send className="h-4 w-4 text-green-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-amber-500" />;
      case 'letter':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const handleSendReminder = (clientName, method) => {
    toast({
      title: "Rappel envoyé",
      description: `Un rappel a été envoyé à ${clientName} via ${method}.`,
    });
  };
  
  const handleTemplateStatusChange = (id, checked) => {
    toast({
      title: checked ? "Modèle activé" : "Modèle désactivé",
      description: `Le modèle de notification a été ${checked ? 'activé' : 'désactivé'}.`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellRing className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Système d'Alertes pour Retards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current-alerts">
          <TabsList className="mb-4">
            <TabsTrigger value="current-alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alertes en cours
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Settings className="h-4 w-4 mr-2" />
              Configuration des modèles
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current-alerts">
            <div className="rounded-md bg-muted p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-medium">Vue d'ensemble</h3>
                  <p className="text-xs text-muted-foreground">
                    4 clients en retard de paiement, pour un montant total de 182,236 FCFA
                  </p>
                </div>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Référence prêt</TableHead>
                  <TableHead>Jours de retard</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernier contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertsData.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.clientName}</TableCell>
                    <TableCell>{alert.loanRef}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-red-500 font-medium">
                        {alert.daysLate} jours
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        {getContactMethodIcon(alert.contactMethod)}
                        <span className="ml-2">{alert.lastContact}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(alert.clientName, 'SMS')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(alert.clientName, 'email')}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(alert.clientName, 'appel')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Appel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="space-y-6">
              {templatesData.map((template) => (
                <div key={template.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {template.type === 'sms' && <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />}
                      {template.type === 'email' && <Send className="h-5 w-5 text-green-500 mr-2" />}
                      {template.type === 'call' && <Phone className="h-5 w-5 text-amber-500 mr-2" />}
                      {template.type === 'letter' && <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Déclenché après {template.triggerDays} jour{template.triggerDays > 1 ? 's' : ''} de retard
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`template-${template.id}`} 
                        checked={template.active}
                        onCheckedChange={(checked) => handleTemplateStatusChange(template.id, checked)}
                      />
                      <Label htmlFor={`template-${template.id}`}>
                        {template.active ? 'Actif' : 'Inactif'}
                      </Label>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">Contenu du modèle:</p>
                    <p className="text-xs mt-1">{template.content}</p>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      Modifier le modèle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
