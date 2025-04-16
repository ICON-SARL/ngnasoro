
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  FileSpreadsheet, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Calculator, 
  Building,
  User
} from 'lucide-react';

const SfdDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const menuItems = [
    {
      title: 'Clients',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      description: 'Gestion des clients, création et validation de comptes',
      path: '/sfd-clients',
      color: 'bg-blue-50'
    },
    {
      title: 'Prêts',
      icon: <CreditCard className="h-8 w-8 text-green-600" />,
      description: 'Gestion des prêts, approbations et décaissements',
      path: '/loans',
      color: 'bg-green-50'
    },
    {
      title: 'Rapports',
      icon: <FileSpreadsheet className="h-8 w-8 text-purple-600" />,
      description: 'Rapports et analyses financières',
      path: '/reports',
      color: 'bg-purple-50'
    },
    {
      title: 'Tableau de bord',
      icon: <BarChart3 className="h-8 w-8 text-amber-600" />,
      description: 'Statistiques et aperçu des performances',
      path: '/statistics',
      color: 'bg-amber-50'
    },
    {
      title: 'Transactions',
      icon: <Calculator className="h-8 w-8 text-rose-600" />,
      description: 'Suivis des transactions financières',
      path: '/transactions',
      color: 'bg-rose-50'
    },
    {
      title: 'Gestion SFD',
      icon: <Building className="h-8 w-8 text-indigo-600" />,
      description: 'Configuration et paramètres de la SFD',
      path: '/sfd-management',
      color: 'bg-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord SFD</h1>
            <p className="text-muted-foreground">
              Bienvenue, {user?.email || 'Administrateur'}. Gérez votre institution financière.
            </p>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/account')}>
            <User className="h-4 w-4" />
            Mon profil
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="overflow-hidden border-gray-200 transition-all hover:shadow-md">
              <CardHeader className={`p-6 ${item.color}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  {item.icon}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full" onClick={() => navigate(item.path)}>
                  Accéder
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SfdDashboard;
