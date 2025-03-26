
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BellRing, LogOut, Settings, User, MessageCircle } from 'lucide-react';

export const SuperAdminHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
              alt="NGNA SÔRÔ! Logo" 
              className="h-8"
            />
            <span className="font-medium text-lg">
              <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
            </span>
          </Link>
          <div className="bg-[#FFAB2E]/10 text-[#FFAB2E] px-2 py-1 rounded text-xs font-medium ml-2">
            Super Admin
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/super-admin" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Dashboard
          </Link>
          <Link to="/agency-dashboard" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Agences
          </Link>
          <Link to="/support" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Support
          </Link>
          <Link to="/security" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Sécurité
          </Link>
          <Link to="/settings" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Paramètres
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <BellRing className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-[#FFAB2E]/10 flex items-center justify-center text-[#FFAB2E]">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Admin</div>
              <div className="text-xs text-muted-foreground">admin@ngnasoro.ml</div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
