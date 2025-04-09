
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Users, CreditCard, Landmark, ArrowRight, FileText, User } from 'lucide-react';

const MainDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <span className="text-sm text-muted-foreground">
          Bienvenue, {user?.user_metadata?.full_name || user?.email || 'Utilisateur'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#0D6A51]/10 border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#0D6A51]" />
              <span>Clients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              onClick={() => navigate('/mobile-flow/clients')}
            >
              Gérer <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-600/10 border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Prêts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate('/mobile-flow/loans')}
            >
              Gérer <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-600/10 border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-amber-600" />
              <span>Épargne</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate('/mobile-flow/savings')}
            >
              Gérer <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-600/10 border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Rapports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate('/mobile-flow/reports')}
            >
              Voir <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Aucune activité récente à afficher.
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Mon profil</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate('/mobile-flow/profile')}
          >
            Voir <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainDashboard;
