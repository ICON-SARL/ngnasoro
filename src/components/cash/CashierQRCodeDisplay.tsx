import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

interface CashierQRCodeDisplayProps {
  sessionId: string;
  sfdId: string;
  stationName?: string;
  onQRGenerated?: (qrData: any) => void;
}

export function CashierQRCodeDisplay({ 
  sessionId, 
  sfdId, 
  stationName = 'Caisse Principale',
  onQRGenerated 
}: CashierQRCodeDisplayProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Fetch existing QR code on mount
  useEffect(() => {
    fetchActiveQRCode();
  }, [sessionId]);

  // Update countdown timer
  useEffect(() => {
    if (!qrCode?.expires_at) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(qrCode.expires_at);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expiré');
        return;
      }

      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [qrCode?.expires_at]);

  const fetchActiveQRCode = async () => {
    try {
      const { data, error } = await supabase
        .from('cashier_qr_codes')
        .select('*')
        .eq('cash_session_id', sessionId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setQrCode(data);
        const expiry = new Date(data.expires_at);
        setIsExpired(expiry < new Date());
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-cashier-qr', {
        body: {
          cash_session_id: sessionId,
          station_name: stationName
        }
      });

      if (error) throw error;

      if (data?.success) {
        setQrCode(data.qr_code);
        setIsExpired(false);
        onQRGenerated?.(data.qr_code);
        
        toast({
          title: 'QR Code généré',
          description: 'Le code QR est prêt pour les transactions clients'
        });
      } else {
        throw new Error(data?.message || 'Erreur lors de la génération');
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer le QR code',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateQRCode = async () => {
    await generateQRCode();
  };

  // Generate QR code SVG data URL
  const generateQRSVG = (data: string) => {
    // Simple QR placeholder - in production use a proper QR library
    const size = 200;
    const encoded = btoa(data);
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="monospace" font-size="12" fill="#0D6A51">
          CAISSE SFD
        </text>
        <text x="50%" y="55%" text-anchor="middle" font-family="monospace" font-size="10" fill="#666">
          ${stationName}
        </text>
        <rect x="20" y="70" width="160" height="110" fill="#f0f0f0" rx="8"/>
        <text x="50%" y="78%" text-anchor="middle" font-family="monospace" font-size="8" fill="#333">
          ${encoded.substring(0, 24)}...
        </text>
      </svg>
    `)}`;
  };

  return (
    <Card className={`border-2 ${isExpired ? 'border-destructive bg-destructive/5' : 'border-primary/20 bg-primary/5'}`}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Guichet
        </CardTitle>
        <CardDescription>
          {qrCode ? (
            <span className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              {isExpired ? (
                <span className="text-destructive font-medium">Expiré - Régénérer</span>
              ) : (
                <span>Expire dans: <strong>{timeRemaining}</strong></span>
              )}
            </span>
          ) : (
            'Générez un QR code pour les transactions au guichet'
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader size="lg" className="mb-2" />
            <p className="text-sm text-muted-foreground">Génération du QR code...</p>
          </div>
        ) : qrCode && !isExpired ? (
          <>
            {/* QR Code Display */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-primary/30">
              <img 
                src={generateQRSVG(qrCode.qr_code_data)} 
                alt="QR Code Caisse"
                className="w-48 h-48"
              />
            </div>
            
            {/* Station Info */}
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {stationName}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Scans: {qrCode.scan_count} / {qrCode.max_scans}
              </p>
            </div>

            {/* Regenerate Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={regenerateQRCode}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Régénérer
            </Button>
          </>
        ) : (
          <>
            {isExpired && (
              <div className="flex items-center gap-2 text-destructive mb-4">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">QR Code expiré</span>
              </div>
            )}
            
            <Button 
              onClick={generateQRCode}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <QrCode className="h-5 w-5 mr-2" />
              {isExpired ? 'Régénérer le QR Code' : 'Générer le QR Code'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Ce QR code permettra aux clients de scanner pour effectuer des dépôts ou retraits au guichet
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
