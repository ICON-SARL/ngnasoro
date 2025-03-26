
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ArchitectureOverview from '@/components/ArchitectureOverview';
import SecurityFeatures from '@/components/SecurityFeatures';
import MicroservicesSection from '@/components/MicroservicesSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Scroll animation for elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          entry.target.classList.remove('opacity-0');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main>
        <Hero />
        <ArchitectureOverview />
        <SecurityFeatures />
        <MicroservicesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
