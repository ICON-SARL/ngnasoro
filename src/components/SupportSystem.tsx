import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, PhoneCall, Mail, HelpCircle, Search, 
  Clock, CheckCircle, AlertCircle, LifeBuoy, Users, Video,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SupportSystem = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [ticketOpen, setTicketOpen] = useState(false);
  
  const faqData = [
    {
      id: 1,
      category: 'general',
      question: 'Comment puis-je réinitialiser mon mot de passe ?',
      answer: 'Pour réinitialiser votre mot de passe, cliquez sur le lien "Mot de passe oublié" sur la page de connexion et suivez les instructions.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Comment mettre à jour mes informations personnelles ?',
      answer: 'Vous pouvez mettre à jour vos informations personnelles dans la section "Paramètres du compte" de votre profil.'
    },
    {
      id: 3,
      category: 'loans',
      question: 'Quels sont les critères d\'éligibilité pour un prêt ?',
      answer: 'Les critères d\'éligibilité varient en fonction du type de prêt. Veuillez consulter la section "Prêts" pour plus d\'informations.'
    },
    {
      id: 4,
      category: 'technical',
      question: 'Que faire si je rencontre des problèmes techniques sur le site ?',
      answer: 'Si vous rencontrez des problèmes techniques, veuillez contacter notre équipe de support technique via le formulaire de contact ou par téléphone.'
    },
  ];
  
  const knowledgeBaseData = [
    {
      id: 1,
      category: 'general',
      title: 'Guide d\'utilisation de la plateforme',
      content: 'Ce guide vous explique comment naviguer et utiliser les différentes fonctionnalités de la plateforme.'
    },
    {
      id: 2,
      category: 'account',
      title: 'Sécurité de votre compte',
      content: 'Conseils et recommandations pour assurer la sécurité de votre compte et de vos informations personnelles.'
    },
    {
      id: 3,
      category: 'loans',
      title: 'Types de prêts disponibles',
      content: 'Description détaillée des différents types de prêts proposés, leurs avantages et leurs conditions.'
    },
  ];
  
  const teamMembers = [
    {
      id: 1,
      name: 'Kouadio Marie',
      role: 'Support Technique',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      status: 'online'
    },
    {
      id: 2,
      name: 'Traoré Moussa',
      role: 'Conseiller Financier',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      status: 'offline'
    },
    {
      id: 3,
      name: 'Koné Fatoumata',
      role: 'Gestionnaire de Comptes',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      status: 'busy'
    },
  ];
  
  const filteredFaqs = faqData.filter(faq => 
    faq.category === selectedCategory && 
    faq.question.toLowerCase().includes(query.toLowerCase())
  );
  
  const filteredKnowledgeBase = knowledgeBaseData.filter(item => 
    item.category === selectedCategory && 
    item.title.toLowerCase().includes(query.toLowerCase())
  );
  
  const handleTicketSubmit = () => {
    toast({
      title: "Ticket soumis",
      description: "Votre demande a été soumise avec succès. Notre équipe vous contactera sous peu.",
    });
    setTicketOpen(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LifeBuoy className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Centre d'Aide et Support
        </CardTitle>
        <CardDescription>
          Trouvez des réponses ou contactez notre équipe de support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Rechercher des réponses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Général</SelectItem>
              <SelectItem value="account">Compte</SelectItem>
              <SelectItem value="loans">Prêts</SelectItem>
              <SelectItem value="technical">Technique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="knowledge-base">
              <FileText className="h-4 w-4 mr-2" />
              Base de connaissances
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Users className="h-4 w-4 mr-2" />
              Contactez-nous
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="border rounded-md p-4">
                  <h3 className="font-medium">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Aucune question fréquente trouvée pour cette catégorie.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="knowledge-base" className="space-y-4">
            {filteredKnowledgeBase.length > 0 ? (
              filteredKnowledgeBase.map((item) => (
                <div key={item.id} className="border rounded-md p-4">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Aucun article de la base de connaissances trouvé pour cette catégorie.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Contactez notre équipe</CardTitle>
                  <CardDescription>
                    Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input type="text" id="name" placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input type="email" id="email" placeholder="votre@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Votre message..." className="min-h-[100px]" />
                  </div>
                  <Button className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90">
                    Envoyer le message
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Notre équipe de support</CardTitle>
                  <CardDescription>
                    Contactez directement un membre de notre équipe.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <Badge variant="secondary">
                          {member.status === 'online' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {member.status === 'offline' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {member.status === 'busy' && <Clock className="h-3 w-3 mr-1" />}
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer un email
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ouvrir un ticket de support
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ouvrir un ticket de support</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Décrivez votre problème et notre équipe vous contactera sous peu.
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input id="name" value="Utilisateur Actuel" className="col-span-3" disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" value="email@example.com" className="col-span-3" disabled />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="message" className="text-right mt-2">
                  Message
                </Label>
                <Textarea id="message" placeholder="Décrivez votre problème..." className="col-span-3 min-h-[100px]" />
              </div>
            </div>
            <Button className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" onClick={handleTicketSubmit}>
              Soumettre le ticket
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
