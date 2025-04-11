
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10">
              Plateforme financière pour les SFD et leurs clients au Mali
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/auth" 
                className="px-8 py-3 rounded-md bg-[#0D6A51] text-white font-medium hover:bg-[#0D6A51]/90 transition-colors"
              >
                Espace Client
              </Link>
              <Link 
                to="/sfd/auth" 
                className="px-8 py-3 rounded-md bg-[#FFAB2E] text-white font-medium hover:bg-[#FFAB2E]/90 transition-colors"
              >
                Espace SFD
              </Link>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-12">Nos Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Microcrédits Simplifiés",
                  description: "Accédez à des microcrédits adaptés à vos besoins avec des processus simplifiés."
                },
                {
                  title: "Gestion des Subventions",
                  description: "Plateforme intégrée pour la gestion des subventions entre les SFD et institutions."
                },
                {
                  title: "Suivi des Comptes",
                  description: "Suivez vos comptes et opérations en temps réel via notre application mobile."
                }
              ].map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-medium mb-3 text-[#0D6A51]">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <img src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" alt="Logo" className="h-8 w-auto mr-2" />
                <span className="text-lg font-medium">
                  <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-white">SÔRÔ!</span>
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 N'GNA SÔRÔ! Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
