
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Send, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminCommunications } from '@/hooks/useAdminCommunications';

export function AdminCommunicationPanel() {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading, error } = useAdminCommunications();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const success = await sendMessage(message);
    if (success) {
      setMessage('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Communication Administrateurs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Textarea
            placeholder="Écrivez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex justify-end">
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
