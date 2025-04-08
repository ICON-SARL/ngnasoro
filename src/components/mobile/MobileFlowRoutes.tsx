
import React from 'react';
import { MobileFlowRoutes as MobileFlowRoutesComponent } from './routes/MobileFlowRoutes';
export type { MobileFlowRoutesProps } from './routes/MobileFlowRoutes';

// Re-export the component for backward compatibility
export const MobileFlowRoutes = MobileFlowRoutesComponent;
export default MobileFlowRoutesComponent;
