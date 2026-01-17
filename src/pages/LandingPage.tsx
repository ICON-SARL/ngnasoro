import React from 'react';
import NavigationHeader from '@/components/landing/NavigationHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FooterSection from '@/components/landing/FooterSection';

const LandingPage: React.FC = () => {
  const handleDownloadClick = () => {
    // Scroll to features or show download options
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onDownloadClick={handleDownloadClick} />
      
      <div id="hero">
        <HeroSection onDownloadClick={handleDownloadClick} />
      </div>
      
      <div id="features">
        <FeaturesSection />
      </div>
      
      <FooterSection />
    </div>
  );
};

export default LandingPage;
