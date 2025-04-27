
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import KycVerificationStatus from './KycVerificationStatus';
import KycDocumentUpload from './KycDocumentUpload';
import KycDocumentList from './KycDocumentList';

const KycVerificationSection = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadComplete = () => {
    setOpen(false);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleViewHistory = () => {
    navigate('/kyc');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">KYC & Vérification</CardTitle>
          <KycVerificationStatus />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <KycDocumentList refreshKey={refreshKey} />
          
          <div className="flex flex-col gap-2 mt-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Téléverser un document</DialogTitle>
                </DialogHeader>
                <KycDocumentUpload onUploadComplete={handleUploadComplete} />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleViewHistory}
            >
              <Shield className="h-4 w-4 mr-2" />
              Historique de vérification KYC
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycVerificationSection;
