
import React from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Determine if we're in an auth route to conditionally show header/footer
  const isAuthRoute = 
    location.pathname.includes('/auth') || 
    location.pathname.includes('/register') || 
    location.pathname === '/';
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthRoute && (
        <header className="border-b border-gray-200 bg-white">
          {/* Header content would go here */}
        </header>
      )}
      
      <main className="flex-grow">
        {children}
      </main>
      
      {!isAuthRoute && (
        <footer className="border-t border-gray-200 bg-gray-50 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} N'GNA SÔRÔ! - Système de Finance Décentralisé
          </div>
        </footer>
      )}
    </div>
  );
};
