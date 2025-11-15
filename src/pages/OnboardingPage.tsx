import React from 'react';
import { OnboardingFlow } from '@/components/mobile/onboarding/OnboardingFlow';

const OnboardingPage: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <OnboardingFlow />
    </div>
  );
};

export default OnboardingPage;
