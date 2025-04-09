
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EmptySfdState = () => {
  const [discoverSfdOpen, setDiscoverSfdOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Comptes SFD</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">
          Vous n'avez pas encore de compte associé à une SFD.
        </p>
        <Button 
          onClick={() => setDiscoverSfdOpen(true)}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Découvrir les SFDs
        </Button>
        
        <Dialog open={discoverSfdOpen} onOpenChange={setDiscoverSfdOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Découvrir les SFDs</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Fonctionnalité en développement. Vous pourrez bientôt découvrir et demander l'accès à de nouvelles SFDs.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EmptySfdState;
