
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSubsidyForm } from './useSubsidyForm';
import { REGIONS } from './constants';
import { SfdSelector } from './SfdSelector';
import { AmountInput } from './AmountInput';
import { PrioritySelector } from './PrioritySelector';
import { RegionSelector } from './RegionSelector';
import { TextInputs } from './TextInputs';
import { DocumentsUploader } from './DocumentsUploader';
import { FormActions } from './FormActions';
import { SubsidyRequestCreateProps } from './types';

export function SubsidyRequestCreate({ onSuccess }: SubsidyRequestCreateProps) {
  const {
    formData,
    isSubmitting,
    availableSfds,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  } = useSubsidyForm(onSuccess || (() => {}));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle demande de prêt MEREF</CardTitle>
        <CardDescription>
          Créez une demande de prêt MEREF pour un SFD partenaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SfdSelector
                sfdId={formData.sfd_id}
                availableSfds={availableSfds}
                onValueChange={(value) => handleSelectChange('sfd_id', value)}
              />
              
              <AmountInput
                value={formData.amount}
                onChange={handleInputChange}
              />
              
              <PrioritySelector
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              />
              
              <RegionSelector
                value={formData.region}
                onValueChange={(value) => handleSelectChange('region', value)}
                regions={REGIONS}
              />
            </div>
            
            <TextInputs
              purpose={formData.purpose}
              justification={formData.justification}
              expectedImpact={formData.expected_impact}
              onChange={handleInputChange}
            />
          </div>
          
          <Separator />
          
          <DocumentsUploader />
          
          <FormActions
            onCancel={onSuccess || (() => {})}
            isSubmitting={isSubmitting}
          />
        </form>
      </CardContent>
    </Card>
  );
}
