
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, MessageCircle, User, Calendar, ArrowUpRight, Bell } from 'lucide-react';

const loanData = [
  { month: 'Jan', amount: 50000 },
  { month: 'Fév', amount: 45000 },
  { month: 'Mar', amount: 40000 },
  { month: 'Avr', amount: 35000 },
  { month: 'Mai', amount: 30000 },
  { month: 'Jun', amount: 25000 },
  { month: 'Jul', amount: 20000 },
  { month: 'Aoû', amount: 15000 },
  { month: 'Sep', amount: 10000 },
  { month: 'Oct', amount: 5000 },
  { month: 'Nov', amount: 0 },
  { month: 'Déc', amount: 0 },
];

const savingsData = [
  { month: 'Jan', amount: 150000 },
  { month: 'Fév', amount: 175000 },
  { month: 'Mar', amount: 200000 },
  { month: 'Avr', amount: 225000 },
  { month: 'Mai', amount: 250000 },
  { month: 'Jun', amount: 275000 },
  { month: 'Jul', amount: 300000 },
  { month: 'Aoû', amount: 325000 },
  { month: 'Sep', amount: 350000 },
  { month: 'Oct', amount: 375000 },
  { month: 'Nov', amount: 400000 },
  { month: 'Déc', amount: 425000 },
];

const pieData = [
  { name: 'Remboursé', value: 75 },
  { name: 'Restant', value: 25 },
];

const COLORS = ['#0088FE', '#BBBBBB'];

const PremiumDashboard = () => {
  const [activeChatbot, setActiveChatbot] = useState(false);
  
  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Premium</h1>
          <p className="text-muted-foreground">Bienvenue sur votre espace client premium</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button className="gap-2">
            <User className="h-4 w-4" />
            Mon profil
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Prêt actuel</CardTitle>
            <CardDescription>État d'avancement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <div>
                <div className="text-muted-foreground">Montant initial</div>
                <div className="font-medium">500 000 XOF</div>
              </div>
              <div>
                <div className="text-muted-foreground">Reste à payer</div>
                <div className="font-medium">125 000 XOF</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Prochain paiement</CardTitle>
            <CardDescription>Échéance à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">15 Juin</div>
                <div className="text-muted-foreground">Dans 12 jours</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <div className="text-sm text-muted-foreground">Montant</div>
                <div className="text-sm font-medium">50 000 XOF</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Méthode</div>
                <div className="text-sm font-medium">Orange Money</div>
              </div>
            </div>
            <Button className="w-full mt-4 gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Payer maintenant
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Épargne totale</CardTitle>
            <CardDescription>Évolution de votre épargne</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">275 000 XOF</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#0062ff" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <div>
                <div className="text-muted-foreground">Dernier dépôt</div>
                <div className="font-medium">25 000 XOF</div>
              </div>
              <div>
                <div className="text-muted-foreground">Intérêts gagnés</div>
                <div className="font-medium">7 500 XOF</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <Tabs defaultValue="remboursements">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="remboursements">Remboursements</TabsTrigger>
            <TabsTrigger value="epargne">Épargne</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="remboursements">
            <Card>
              <CardHeader>
                <CardTitle>Historique des remboursements</CardTitle>
                <CardDescription>Visualisation de vos remboursements de prêt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ChartContainer config={{ loan: { color: '#0062ff' } }}>
                    <BarChart data={loanData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" name="Montant restant" fill="var(--color-loan, #0062ff)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="epargne">
            <Card>
              <CardHeader>
                <CardTitle>Évolution de l'épargne</CardTitle>
                <CardDescription>Croissance de votre épargne au fil du temps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ChartContainer config={{ savings: { color: '#10b981' } }}>
                    <LineChart data={savingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" name="Montant épargné" stroke="var(--color-savings, #10b981)" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>Toutes vos transactions récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} dark:bg-opacity-20`}>
                          {i % 2 === 0 ? '+' : '-'}
                        </div>
                        <div>
                          <div className="font-medium">{i % 2 === 0 ? 'Dépôt' : 'Retrait'}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(2023, 5, 15 - i * 3).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {i % 2 === 0 ? '+' : '-'}{(25000 - i * 5000).toLocaleString('fr-FR')} XOF
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Chatbot toggle button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          className={`rounded-full shadow-lg ${activeChatbot ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'}`}
          size="icon"
          onClick={() => setActiveChatbot(!activeChatbot)}
        >
          {activeChatbot ? <AlertCircle className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Chatbot panel */}
      {activeChatbot && (
        <div className="fixed bottom-32 right-4 w-80 bg-card border rounded-lg shadow-xl z-40 overflow-hidden">
          <div className="p-3 border-b bg-muted flex justify-between items-center">
            <div className="font-medium">Assistant vocal</div>
            <Button variant="ghost" size="sm" onClick={() => setActiveChatbot(false)}>
              &times;
            </Button>
          </div>
          <div className="p-3 h-80 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-primary/10 p-2 rounded-lg rounded-tl-none max-w-[80%]">
                Bonjour, comment puis-je vous aider aujourd'hui?
              </div>
              <div className="bg-muted p-2 rounded-lg rounded-tr-none max-w-[80%] ml-auto">
                Je voudrais savoir quand est mon prochain paiement
              </div>
              <div className="bg-primary/10 p-2 rounded-lg rounded-tl-none max-w-[80%]">
                Votre prochain paiement est prévu pour le 15 juin. Le montant est de 50,000 XOF.
              </div>
            </div>
          </div>
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input placeholder="Tapez votre message..." className="flex-1" />
              <Button size="sm">Envoyer</Button>
            </div>
            <div className="text-xs text-center mt-2 text-muted-foreground">
              Ou appuyez sur le micro pour parler
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumDashboard;
