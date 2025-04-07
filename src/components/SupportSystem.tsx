import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Video, 
  Search, 
  Mic, 
  Phone, 
  PhoneCall,
  PhoneOff,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useLocalization } from '@/contexts/LocalizationContext';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  assignedTo?: string;
}

const mockTickets: Ticket[] = [
  {
    id: 'TICKET-001',
    title: 'Problème de connexion à l\'API bancaire',
    description: 'L\'intégration avec Flutterwave échoue avec l\'erreur 401',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'TICKET-002',
    title: 'Échec de vérification KYC',
    description: 'Le scanner OCR ne reconnaît pas les cartes d\'identité maliennes',
    status: 'in-progress',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    assignedTo: 'Support Technique',
  },
  {
    id: 'TICKET-003',
    title: 'Problème de performance application mobile',
    description: 'L\'application ralentit considérablement sur les réseaux 2G',
    status: 'open',
    priority: 'medium',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
];

const diagnosticProblems = [
  {
    id: 'DIAG-001',
    title: 'Vérification des services API',
    status: 'success',
    details: 'Tous les services API sont opérationnels',
  },
  {
    id: 'DIAG-002',
    title: 'Vérification des connexions réseau',
    status: 'warning',
    details: 'Latence élevée détectée sur la connexion à Flutterwave',
  },
  {
    id: 'DIAG-003',
    title: 'État des services de stockage',
    status: 'error',
    details: 'Échec de connexion à AWS S3 pour l\'archivage des documents',
  },
  {
    id: 'DIAG-004',
    title: 'Services d\'authentification',
    status: 'success',
    details: 'Service OTP et authentification fonctionnels',
  },
];

export const SupportSystem = () => {
  const { toast } = useToast();
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium' });
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { language, t } = useLocalization();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    const ticket: Ticket = {
      id: `TICKET-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority as 'low' | 'medium' | 'high' | 'urgent',
      createdAt: new Date(),
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({ title: '', description: '', priority: 'medium' });

    toast({
      title: "Ticket créé",
      description: `Le ticket ${ticket.id} a été créé avec succès.`,
    });

    // In a real implementation, this would send the ticket to Zendesk API
    console.log("Sending ticket to Zendesk API:", ticket);
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsVideoCallActive(true);
      
      toast({
        title: "Appel vidéo démarré",
        description: "Un agent va vous rejoindre sous peu.",
      });

      // In a real implementation, this would initiate a WebRTC connection
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra ou au microphone.",
        variant: "destructive",
      });
    }
  };

  const endVideoCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsVideoCallActive(false);
    
    toast({
      title: "Appel terminé",
      description: "L'appel vidéo a été terminé.",
    });
  };

  const startVoiceFeedback = () => {
    setIsRecording(true);
    
    toast({
      title: "Enregistrement démarré",
      description: "Parlez pour enregistrer votre feedback.",
    });

    // In a real implementation, this would use the Web Speech API
    // or connect to a service like AWS Transcribe
    
    // Simulate ending recording after 5 seconds
    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Feedback envoyé",
        description: "Votre feedback vocal a été enregistré. Merci !",
      });
    }, 5000);
  };

  const runDiagnostic = () => {
    toast({
      title: "Diagnostic en cours",
      description: "Analyse des systèmes et services...",
    });

    // In a real implementation, this would run actual diagnostics
    // For now, we're just displaying mock data
  };

  const SupportContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Système de Support</CardTitle>
          <CardDescription>
            Gérez les tickets de support, initiez des appels vidéo et exécutez des diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tickets">
            <TabsList className="mb-4">
              <TabsTrigger value="tickets">
                <MessageCircle className="h-4 w-4 mr-2" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Support Vidéo
              </TabsTrigger>
              <TabsTrigger value="diagnostic">
                <Search className="h-4 w-4 mr-2" />
                Diagnostic
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <Mic className="h-4 w-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Tickets de support</h3>
                {isMobile ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button>Nouveau Ticket</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Créer un ticket</DrawerTitle>
                        <DrawerDescription>
                          Remplissez les informations pour ouvrir un nouveau ticket de support.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 space-y-4">
                        <Input
                          placeholder="Titre du ticket"
                          value={newTicket.title}
                          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Description détaillée du problème"
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          className="min-h-[100px]"
                        />
                        <div>
                          <label className="text-sm font-medium">Priorité</label>
                          <select
                            className="w-full mt-1 rounded-md border-input bg-background px-3 py-2 text-sm"
                            value={newTicket.priority}
                            onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                          >
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="urgent">Urgente</option>
                          </select>
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button onClick={handleCreateTicket}>Soumettre le ticket</Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Annuler</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Nouveau Ticket</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un ticket</DialogTitle>
                        <DialogDescription>
                          Remplissez les informations pour ouvrir un nouveau ticket de support.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Titre du ticket"
                          value={newTicket.title}
                          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Description détaillée du problème"
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          className="min-h-[100px]"
                        />
                        <div>
                          <label className="text-sm font-medium">Priorité</label>
                          <select
                            className="w-full mt-1 rounded-md border-input bg-background px-3 py-2 text-sm"
                            value={newTicket.priority}
                            onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                          >
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="urgent">Urgente</option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateTicket}>Soumettre le ticket</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <Input
                placeholder="Rechercher un ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <div className="space-y-4">
                {tickets
                  .filter(ticket => 
                    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{ticket.id}</h4>
                          <Badge variant={
                            ticket.priority === 'urgent' ? 'destructive' :
                            ticket.priority === 'high' ? 'destructive' :
                            ticket.priority === 'medium' ? 'default' :
                            'outline'
                          }>
                            {ticket.priority}
                          </Badge>
                          <Badge variant={
                            ticket.status === 'open' ? 'outline' :
                            ticket.status === 'in-progress' ? 'default' :
                            'secondary'
                          }>
                            {ticket.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {ticket.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium mt-2">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                      {ticket.assignedTo && (
                        <p className="text-xs mt-2">Assigné à: {ticket.assignedTo}</p>
                      )}
                    </div>
                  ))
                }
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                {isVideoCallActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={endVideoCall}
                        className="rounded-full"
                      >
                        <PhoneOff className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col">
                    <Video className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Support vidéo en direct</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">
                      Connectez-vous avec un agent de support via un appel vidéo pour une assistance en temps réel.
                    </p>
                    <Button onClick={startVideoCall}>
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Démarrer l'appel vidéo
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">À propos du support vidéo</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Connectez-vous face à face avec un agent de support</li>
                  <li>Montrez votre problème en partageant votre écran</li>
                  <li>Recevez une assistance guidée en temps réel</li>
                  <li>Les appels sont sécurisés et cryptés de bout en bout</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="diagnostic" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Diagnostic du système</h3>
                <Button onClick={runDiagnostic}>Lancer le diagnostic</Button>
              </div>
              
              <div className="space-y-4">
                {diagnosticProblems.map(problem => (
                  <div key={problem.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        problem.status === 'success' ? 'bg-green-500' :
                        problem.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <h4 className="font-medium">{problem.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-5">{problem.details}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="feedback" className="space-y-4">
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Feedback vocal</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Partagez vos commentaires ou signaler un problème verbalement. 
                  Enregistrez votre message et nous l'analyserons pour améliorer nos services.
                </p>
                <Button 
                  onClick={startVoiceFeedback}
                  variant={isRecording ? "destructive" : "default"}
                  className="rounded-full px-6"
                >
                  {isRecording ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Arrêter l'enregistrement
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Commencer l'enregistrement
                    </>
                  )}
                </Button>
                
                {isRecording && (
                  <div className="mt-4 animate-pulse text-sm text-muted-foreground">
                    Enregistrement en cours...
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Status du Système</CardTitle>
          <CardDescription>
            État actuel des services et informations de contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Services actifs</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Gateway</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Opérationnel</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Service de paiement</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Opérationnel</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authentification</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Opérationnel</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stockage S3</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Perturbation</Badge>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Contact support</h3>
              <div className="space-y-2 text-sm">
                <p>Email: support@ngnasoro.ml</p>
                <p>Téléphone: +223 76 54 32 10</p>
                <p>Heures: 8h00 - 18h00 (UTC+0)</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Support en direct</h3>
              <Button variant="outline" className="w-full" onClick={startVideoCall}>
                <Video className="h-4 w-4 mr-2" />
                Démarrer chat vidéo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return <SupportContent />;
};

export default SupportSystem;
