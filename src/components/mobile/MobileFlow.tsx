import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const MobileFlowMainPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">MEREF Mobile Flow</h1>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Link to="/mobile-flow/funds">
            <Button className="w-full">Gestion des Fonds</Button>
          </Link>
          
          <Link to="/mobile-flow/secure-payment">
            <Button className="w-full">Paiement Sécurisé</Button>
          </Link>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-medium mb-2">Accès Administration</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/admin/auth">
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Admin MEREF
              </Button>
            </Link>
            
            <Link to="/sfd/auth">
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Admin SFD
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileFlow = () => {
  return (
    <Routes>
      <Route path="/" element={<MobileFlowMainPage />} />
      <Route path="main" element={<MobileFlowMainPage />} />
      {/* Other mobile flow routes can be added here */}
    </Routes>
  );
};

export default MobileFlow;
