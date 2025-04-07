import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, FilePen, FileSignature, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ElectronicSignature = () => {
  const { toast } = useToast();
  const [signature, setSignature] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isSigning, setIsSigning] = useState(false);
  
  const startSigning = () => {
    setIsSigning(true);
  };
  
  const endSigning = () => {
    setIsSigning(false);
  };
  
  const drawSignature = (e) => {
    if (!isSigning) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    setSignature(canvas.toDataURL());
    setIsDialogOpen(false);
    
    toast({
      title: "Signature enregistrée",
      description: "Votre signature électronique a été sauvegardée avec succès.",
    });
  };
  
  const handleDownload = () => {
    if (!signature) {
      toast({
        title: "Aucune signature",
        description: "Veuillez enregistrer votre signature avant de la télécharger.",
        variant: "destructive",
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = signature;
    link.download = 'signature.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSignature className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Signature Électronique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {signature ? (
          <div className="flex flex-col items-center space-y-2">
            <img src={signature} alt="Electronic Signature" className="border rounded-md" style={{ maxWidth: '300px' }} />
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Aucune signature enregistrée.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          <FilePen className="h-4 w-4 mr-2" />
          Créer/Modifier la signature
        </Button>
      </CardFooter>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer votre signature</DialogTitle>
            <DialogDescription>
              Signez dans la zone ci-dessous et enregistrez votre signature électronique.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="border rounded-md cursor-pointer"
              style={{ border: '1px solid #ccc' }}
              onMouseDown={startSigning}
              onMouseUp={endSigning}
              onMouseOut={endSigning}
              onMouseMove={drawSignature}
            />
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-md">
                <span className="text-lg text-muted-foreground">Signez ici</span>
              </div>
            )}
          </div>
          <DialogFooter className="space-x-2">
            <Button type="button" variant="secondary" onClick={clearSignature}>
              Effacer
            </Button>
            <Button type="button" onClick={saveSignature} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
