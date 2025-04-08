
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ServicesSection from '@/components/landing/ServicesSection';
import PartnersSection from '@/components/landing/PartnersSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CtaSection from '@/components/landing/CtaSection';
import { Footer } from '@/components';

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Remove any unnecessary state or effects that might cause loops
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white dark:from-gray-950 dark:to-gray-900">
      <Header />
      <Hero />
      <FeaturesSection />
      <ServicesSection />
      <PartnersSection />
      <TestimonialsSection />
      <CtaSection />
      {/* Remove Footer from here as it's already included in AppWithFooter */}
    </div>
  );
};

export default LandingPage;
