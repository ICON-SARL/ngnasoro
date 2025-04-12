
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RefreshCw } from 'lucide-react';

interface TestFormSectionProps {
  endpointUrl: string;
  method: string;
  testName: string;
  payload: string;
  isLoading: boolean;
  onEndpointChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onTestNameChange: (value: string) => void;
  onPayloadChange: (value: string) => void;
  onRunTest: () => void;
  onClearResults: () => void;
}

export function TestFormSection({ 
  endpointUrl,
  method,
  testName,
  payload,
  isLoading,
  onEndpointChange,
  onMethodChange,
  onTestNameChange,
  onPayloadChange,
  onRunTest,
  onClearResults
}: TestFormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endpoint">Point d'accès API</Label>
          <Input
            id="endpoint"
            placeholder="URL du point d'accès"
            value={endpointUrl}
            onChange={(e) => onEndpointChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="method">Méthode HTTP</Label>
          <Select value={method} onValueChange={onMethodChange}>
            <SelectTrigger id="method">
              <SelectValue placeholder="Méthode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="testName">Nom du test</Label>
        <Input
          id="testName"
          placeholder="Entrez un nom pour ce test"
          value={testName}
          onChange={(e) => onTestNameChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="payload">Données JSON (pour POST/PUT)</Label>
        <Textarea
          id="payload"
          placeholder='{"key": "value"}'
          value={payload}
          onChange={(e) => onPayloadChange(e.target.value)}
          rows={5}
          className="font-mono text-sm"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onClearResults}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button
          onClick={onRunTest}
          disabled={isLoading || !endpointUrl}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Exécuter le test
        </Button>
      </div>
    </div>
  );
}
