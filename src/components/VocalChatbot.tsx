
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const VocalChatbot = () => {
  const { language, t } = useLocalization();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: language === 'bambara' ? 
        'I ni ce! Ne ye i dɛmɛbaga Soro ye. I bɛ se ka n ɲininka fɛn o fɛn na MEREF-SFD kan.' : 
        'Bonjour! Je suis Soro, votre assistant. Vous pouvez me poser toutes vos questions sur MEREF-SFD.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bambaraResponses = [
    "I ka ɲininkali ɲɛnabɔra. I bɛ se ka taa Agents page la ka i ka jɔyɔrɔ dɔn.",
    "N hakili la i mako bɛ dɛmɛ dɔ la. I bɛ se ka taa SFD min bɛ i kɛrɛfɛ ka kuma olu fɛ.",
    "MEREF-SFD bɛ i dɛmɛ i ka sɔrɔ sabati kama ani ka jɔyɔrɔ di i ka cibow ma.",
    "I ni ce i ka ɲininkali kosɔn. I mako bɛ dɛmɛ wɛrɛ dɔ la wa?",
    "N tɛ i ka ɲininkali faamu. I bɛ se k'a ɲɛfɔ cogowɛrɛ la wa?"
  ];

  const frenchResponses = [
    "J'ai bien compris votre demande. Vous pouvez consulter la page Agents pour plus d'informations.",
    "Je pense que vous avez besoin d'aide. Vous pouvez contacter l'agence SFD la plus proche.",
    "MEREF-SFD vous aide à stabiliser vos revenus et à financer vos projets.",
    "Merci pour votre question. Avez-vous besoin d'autre chose ?",
    "Je ne comprends pas votre question. Pouvez-vous reformuler ?"
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simuler la réponse du bot
    setTimeout(() => {
      const responsePool = language === 'bambara' ? bambaraResponses : frenchResponses;
      const botResponse: Message = {
        id: messages.length + 2,
        text: responsePool[Math.floor(Math.random() * responsePool.length)],
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const toggleRecording = () => {
    // Dans une implémentation réelle, ceci utiliserait l'API Web Speech
    // ou se connecterait à un service comme Rasa NLP
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Simuler un résultat de reconnaissance vocale
      setTimeout(() => {
        setNewMessage(
          language === 'bambara' 
            ? 'N mako bɛ dɛmɛ la juru ta kama'
            : "J'ai besoin d'aide pour obtenir un prêt"
        );
        setIsRecording(false);
      }, 2000);
    }
  };

  // Défiler vers le bas quand les messages sont mis à jour
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="w-full h-[400px] flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-lg flex items-center">
          <Volume2 className="h-5 w-5 mr-2 text-primary" />
          {language === 'bambara' ? 'I ni ce, n tɔgɔ ye Soro' : 'Bonjour, je suis Soro'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 max-w-[80%] ${
                message.sender === 'user' ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.text}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t mt-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={isRecording ? 'text-red-500' : ''}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Input
              placeholder={language === 'bambara' ? 'I ka kuma sɛbɛn yan...' : 'Tapez votre message ici...'}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VocalChatbot;
