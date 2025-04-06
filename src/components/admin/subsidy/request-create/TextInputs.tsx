
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TextInputsProps {
  purpose: string;
  justification: string;
  expectedImpact: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function TextInputs({ purpose, justification, expectedImpact, onChange }: TextInputsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="purpose">Objet du prêt</Label>
        <Input
          id="purpose"
          name="purpose"
          value={purpose}
          onChange={onChange}
          placeholder="ex: Financement de microcrédits agricoles"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="justification">Justification</Label>
        <Textarea
          id="justification"
          name="justification"
          value={justification}
          onChange={onChange}
          placeholder="Décrivez pourquoi ce prêt est nécessaire..."
          rows={3}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expected_impact">Impact attendu</Label>
        <Textarea
          id="expected_impact"
          name="expected_impact"
          value={expectedImpact}
          onChange={onChange}
          placeholder="Décrivez l'impact socio-économique attendu de ce prêt..."
          rows={3}
          required
        />
      </div>
    </div>
  );
}
