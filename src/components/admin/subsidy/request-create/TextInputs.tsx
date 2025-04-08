
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        <Label htmlFor="purpose">Objet de la demande *</Label>
        <Input
          id="purpose"
          name="purpose"
          placeholder="Objectif de ce financement"
          value={purpose}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="justification">Justification *</Label>
        <Textarea
          id="justification"
          name="justification"
          placeholder="Expliquez pourquoi ce financement est nécessaire"
          value={justification}
          onChange={onChange}
          rows={3}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expected_impact">Impact attendu</Label>
        <Textarea
          id="expected_impact"
          name="expected_impact"
          placeholder="Décrivez l'impact attendu de ce financement"
          value={expectedImpact}
          onChange={onChange}
          rows={3}
        />
      </div>
    </div>
  );
}
