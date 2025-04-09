
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquareIcon, SendIcon, BotIcon, UserIcon } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Bienvenue sur l\'assistant MEREF pour les SFDs. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      // Simple pattern matching for demo purposes
      if (input.toLowerCase().includes('rapport')) {
        response = 'Pour générer un rapport, allez dans la section "Rapports" du tableau de bord et sélectionnez le type de rapport souhaité. Vous pouvez filtrer par période et exporter au format PDF ou Excel.';
      } else if (input.toLowerCase().includes('règlement') || input.toLowerCase().includes('loi')) {
        response = 'Les mises à jour réglementaires sont disponibles dans la section "Mises à Jour Réglementaires". La dernière mise à jour concerne la Directive UEMOA 2023-05 sur le plafonnement des taux d\'intérêt pour les microcrédits.';
      } else if (input.toLowerCase().includes('fraude')) {
        response = 'Notre système de détection de fraude surveille automatiquement les transactions suspectes. Si vous constatez une activité inhabituelle, signalez-la immédiatement via la section "Détection de Fraude".';
      } else {
        response = 'Je comprends votre question. Pour obtenir plus d\'informations à ce sujet, consultez notre documentation ou contactez notre équipe de support technique au +225 27 20 XX XX XX.';
      }
      
      const aiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquareIcon className="mr-2 h-6 w-6 text-primary" />
          Assistant IA MEREF
        </CardTitle>
        <CardDescription>
          Posez vos questions sur la réglementation, la gestion des SFDs ou la génération de rapports
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 max-h-[500px]">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.role === 'user' 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                }`}
              >
                <Avatar className={`h-8 w-8 ${message.role === 'assistant' ? 'bg-primary' : 'bg-muted'}`}>
                  {message.role === 'assistant' ? (
                    <BotIcon className="h-4 w-4 text-white" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </Avatar>
                
                <div 
                  className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-2 mt-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="flex-shrink-0" 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
