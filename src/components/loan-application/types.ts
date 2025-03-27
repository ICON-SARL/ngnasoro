
import { ReactNode } from 'react';

export type LoanApplicationStep = 'start' | 'purpose' | 'amount' | 'duration' | 'location' | 'review' | 'complete';

export interface PurposeOption {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
}

export interface StepConfig {
  title: string;
  voiceMessage: string;
  nextLabel: string;
  prevLabel?: string;
  icon: ReactNode;
  progress: number;
}
