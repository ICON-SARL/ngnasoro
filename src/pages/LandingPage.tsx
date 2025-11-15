import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NavigationHeader from '@/components/landing/NavigationHeader';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import SfdPartnersSection from '@/components/landing/SfdPartnersSection';
import DownloadSection from '@/components/landing/DownloadSection';
import FooterSection from '@/components/landing/FooterSection';
import DownloadSheet from '@/components/landing/DownloadSheet';

const LandingPage: React.FC = () => {
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);
  const [hasSeenSheet, setHasSeenSheet] = useState(false);

  useEffect(() => {
    // Check if user has seen the sheet in last 24h
    const lastSeen = localStorage.getItem('downloadSheetLastSeen');
    if (lastSeen && Date.now() - parseInt(lastSeen) < 24 * 60 * 60 * 1000) {
      setHasSeenSheet(true);
      return;
    }

    // Show sheet after 3 seconds
    const timer = setTimeout(() => {
      setShowDownloadSheet(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasSeenSheet) {
      // Show sheet when scrolling past 50%
      const handleScroll = () => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercentage > 50) {
          setShowDownloadSheet(true);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [hasSeenSheet]);

  const handleSheetClose = () => {
    setShowDownloadSheet(false);
    setHasSeenSheet(true);
    localStorage.setItem('downloadSheetLastSeen', Date.now().toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <NavigationHeader onDownloadClick={() => setShowDownloadSheet(true)} />
      <div id="hero">
        <HeroSection onDownloadClick={() => setShowDownloadSheet(true)} />
      </div>
      <div id="stats">
        <StatsSection />
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <div id="sfd-partners">
        <SfdPartnersSection />
      </div>
      <div id="download">
        <DownloadSection onDownloadClick={() => setShowDownloadSheet(true)} />
      </div>
      <FooterSection />
      
      <DownloadSheet 
        open={showDownloadSheet} 
        onOpenChange={handleSheetClose}
      />
    </div>
  );
};

export default LandingPage;
