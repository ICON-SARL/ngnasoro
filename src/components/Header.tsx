
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ease-soft", 
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/80" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-medium">
            S
          </div>
          <Link to="/" className="font-medium text-lg">SecureFlux</Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#architecture" className="text-sm font-medium hover:text-primary transition-colors">
            Architecture
          </a>
          <a href="#security" className="text-sm font-medium hover:text-primary transition-colors">
            Security
          </a>
          <a href="#microservices" className="text-sm font-medium hover:text-primary transition-colors">
            Microservices
          </a>
          <a href="#compliance" className="text-sm font-medium hover:text-primary transition-colors">
            Compliance
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/mobile-flow" className="text-sm font-medium hover:text-primary transition-colors">
            Mobile Flow
          </Link>
          <Link to="/premium-dashboard" className="hidden md:inline-flex h-9 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Dashboard
          </Link>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
