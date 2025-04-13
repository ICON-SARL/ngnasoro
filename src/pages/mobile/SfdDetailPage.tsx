
import React from 'react';
import { ArrowLeft, Building, Users, CreditCard, Wallet, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

const SfdDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { sfdId } = useParams<{ sfdId: string }>();
  const { user, userRole } = useAuth();
  
  // Get SFD data based on ID - in a real app, this would come from an API
  const sfdData = {
    'troisieme-sfd': { 
      name: 'Troisième SFD', 
      code: 'SFD3', 
      region: 'Sikasso',
      clients: 2345,
      activeLoans: 542,
      totalSavings: '45,678,900 FCFA'
    },
    'caurie-mf': { 
      name: 'CAURIE-MF', 
      code: 'CAURIE', 
      region: 'Bamako',
      clients: 1890,
      activeLoans: 423,
      totalSavings: '38,450,300 FCFA'
    },
    'nyesigiso': { 
      name: 'Nyèsigiso', 
      code: 'NYE', 
      region: 'Ségou',
      clients: 3120,
      activeLoans: 687,
      totalSavings: '56,234,100 FCFA'
    },
    'kafo-jiginew': { 
      name: 'Kafo Jiginew', 
      code: 'KAFO', 
      region: 'Koulikoro',
      clients: 4230,
      activeLoans: 892,
      totalSavings: '78,912,500 FCFA'
    },
    'soro-yiriwaso': { 
      name: 'Soro Yiriwaso', 
      code: 'SORO', 
      region: 'Bamako',
      clients: 1560,
      activeLoans: 362,
      totalSavings: '32,145,700 FCFA'
    },
    'miselini': { 
      name: 'Miselini', 
      code: 'MISE', 
      region: 'Sikasso',
      clients: 1230,
      activeLoans: 287,
      totalSavings: '28,761,400 FCFA'
    }
  }[sfdId || ''] || { name: 'SFD Non Trouvé', code: 'N/A', region: 'N/A', clients: 0, activeLoans: 0, totalSavings: '0 FCFA' };
  
  // Check if the user has SFD admin rights for this SFD or is a super admin
  const isSfdAdmin = userRole === 'sfd_admin';
  const isSuperAdmin = userRole === 'admin';
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0D6A51] text-white p-4 flex items-center shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 text-white hover:bg-[#0D6A51]/20" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{sfdData.name}</h1>
          <p className="text-xs opacity-80">{sfdData.code} • {sfdData.region}</p>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-gray-100">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Users className="h-6 w-6 text-[#0D6A51] mb-1" />
              <div className="font-medium">{sfdData.clients}</div>
              <div className="text-xs text-gray-500">Clients</div>
            </CardContent>
          </Card>
          <Card className="border-gray-100">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <CreditCard className="h-6 w-6 text-[#0D6A51] mb-1" />
              <div className="font-medium">{sfdData.activeLoans}</div>
              <div className="text-xs text-gray-500">Prêts actifs</div>
            </CardContent>
          </Card>
          <Card className="border-gray-100">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Wallet className="h-6 w-6 text-[#0D6A51] mb-1" />
              <div className="font-medium text-xs sm:text-sm">
                {sfdData.totalSavings.length > 10 
                  ? sfdData.totalSavings.substring(0, 10) + '...' 
                  : sfdData.totalSavings}
              </div>
              <div className="text-xs text-gray-500">Épargne</div>
            </CardContent>
          </Card>
        </div>
        
        {(isSfdAdmin || isSuperAdmin) && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <Building className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Vue Administration SFD</h3>
                <p className="text-sm text-blue-800">
                  Vous avez des accès administratifs pour cette SFD
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <h2 className="font-medium text-lg">Services</h2>
          
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-0">
              <Button variant="ghost" className="w-full justify-between p-4 rounded-none">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 mr-3 text-[#0D6A51]" />
                  <span>Comptes d'épargne</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-0">
              <Button variant="ghost" className="w-full justify-between p-4 rounded-none">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-[#0D6A51]" />
                  <span>Prêts disponibles</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
          
          {(isSfdAdmin || isSuperAdmin) && (
            <>
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-0">
                  <Button variant="ghost" className="w-full justify-between p-4 rounded-none">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3 text-[#0D6A51]" />
                      <span>Gestion des clients</span>
                      <Badge className="ml-2 bg-[#0D6A51]">Admin</Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-0">
                  <Button variant="ghost" className="w-full justify-between p-4 rounded-none">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-3 text-[#0D6A51]" />
                      <span>Paramètres SFD</span>
                      <Badge className="ml-2 bg-[#0D6A51]">Admin</Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SfdDetailPage;
