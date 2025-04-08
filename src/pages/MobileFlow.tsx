
import React from 'react';
import { 
  MobileFlowRoutes, 
  MobileFlowRoutesProps 
} from '@/components/mobile/MobileFlowRoutes';
import MobileLayout from '@/components/mobile/layout/MobileLayout';

interface MobileFlowProps extends MobileFlowRoutesProps {}

export const MobileFlow: React.FC<MobileFlowProps> = (props) => {
  return (
    <MobileLayout>
      <MobileFlowRoutes {...props} />
    </MobileLayout>
  );
};
