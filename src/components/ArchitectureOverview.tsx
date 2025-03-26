
import React from 'react';
import { DollarSign } from 'lucide-react';

const ArchitectureOverview = () => {
  return (
    <section id="architecture" className="py-20 md:py-28 relative">
      <div className="absolute inset-0 -z-10 bg-secondary/50 dark:bg-secondary/10"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            Architecture Technique
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Architecture Microservices Évolutive
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une architecture hautement évolutive et sécurisée, conçue pour les applications financières avec des composants isolés et un chiffrement de bout en bout.
          </p>
        </div>
        
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 order-2 md:order-1">
              <div className="space-y-6 [perspective:1000px]">
                <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(10deg)]">
                  <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                      <h3 className="font-medium">Plateforme N'GNA SÔRÔ!</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Application multiplateforme avec une base de code partagée entre web et mobile, communications API sécurisées et fonctionnalités hors ligne.
                    </p>
                  </div>
                </div>
                
                <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(10deg)]">
                  <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3c.5327 0 .935.4537.9945.9961l.0055.0039v16c0 .5327-.4537.935-.9961.9945L12 21c-.5327 0-.935-.4537-.9945-.9961L11 20V4c0-.5327.4537-.935.9961-.9945L12 3Z" />
                          <path d="M19 6c.5327 0 .935.4537.9945.9961L20 7v10c0 .5327-.4537.935-.9961.9945L19 18h-2c-.5327 0-.935-.4537-.9945-.9961L16 17V7c0-.5327.4537-.935.9961-.9945L17 6h2Z" />
                          <path d="M5 6h2c.5327 0 .935.4537.9945.9961L8 7v10c0 .5327-.4537.935-.9961.9945L7 18H5c-.5327 0-.935-.4537-.9945-.9961L4 17V7c0-.5327.4537-.935.9961-.9945L5 6Z" />
                        </svg>
                      </div>
                      <h3 className="font-medium">Système MEREF de Subventionnement</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Couche centralisée de gestion des subventions aux institutions de microfinance, avec analyse des performances, gestion des fonds et suivi des résultats.
                    </p>
                  </div>
                </div>
                
                <div className="relative [transform-style:preserve-3d] [transform:rotateY(-10deg)_rotateX(10deg)]">
                  <div className="p-5 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <h3 className="font-medium">Isolation des Données SFD</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Isolation des bases de données par institution financière avec PostgreSQL pour les données structurées et MongoDB pour l'analytique, garantissant la ségrégation des données.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-1 md:order-2 relative">
              <div className="rounded-lg border shadow-sm p-2 bg-white dark:bg-gray-900">
                <div className="w-full aspect-square md:aspect-auto md:h-[400px] relative bg-secondary/30 rounded overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* MEREF Layer */}
                    <rect x="140" y="20" width="120" height="40" rx="4" fill="#FCF3D9" stroke="#FFAB2E" strokeWidth="1.5"/>
                    <text x="200" y="45" textAnchor="middle" fill="#FFAB2E" fontSize="14" fontWeight="500">MEREF Initiative</text>
                    
                    {/* SFD Layer */}
                    <rect x="140" y="100" width="120" height="40" rx="4" fill="#D6EFEA" stroke="#0D6A51" strokeWidth="1.5"/>
                    <text x="200" y="125" textAnchor="middle" fill="#0D6A51" fontSize="14" fontWeight="500">SFD Institutions</text>
                    
                    {/* Connection lines */}
                    <line x1="200" y1="60" x2="200" y2="100" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Client Services */}
                    <rect x="40" y="180" width="80" height="40" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5"/>
                    <text x="80" y="205" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="500">Prêts Ruraux</text>
                    
                    <rect x="160" y="180" width="80" height="40" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5"/>
                    <text x="200" y="205" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="500">Prêts Urbains</text>
                    
                    <rect x="280" y="180" width="80" height="40" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5"/>
                    <text x="320" y="205" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="500">Épargne</text>
                    
                    {/* Connection lines from SFDs to Services */}
                    <line x1="180" y1="140" x2="80" y2="180" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="140" x2="200" y2="180" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="220" y1="140" x2="320" y2="180" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Beneficiaries */}
                    <rect x="40" y="260" width="80" height="40" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5"/>
                    <text x="80" y="285" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">Agriculteurs</text>
                    
                    <rect x="160" y="260" width="80" height="40" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5"/>
                    <text x="200" y="285" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">Entrepreneurs</text>
                    
                    <rect x="280" y="260" width="80" height="40" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5"/>
                    <text x="320" y="285" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">Particuliers</text>
                    
                    {/* Connections from Services to Beneficiaries */}
                    <line x1="80" y1="220" x2="80" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="220" x2="200" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="320" y1="220" x2="320" y2="260" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Platform Layer */}
                    <rect x="30" y="330" width="340" height="30" rx="4" fill="#F0FDF4" stroke="#059669" strokeWidth="1.5"/>
                    <text x="200" y="350" textAnchor="middle" fill="#059669" fontSize="12" fontWeight="500">Plateforme N'GNA SÔRÔ!</text>
                    
                    {/* Connection to Platform Layer */}
                    <line x1="80" y1="300" x2="80" y2="330" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="200" y1="300" x2="200" y2="330" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="320" y1="300" x2="320" y2="330" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Animated dots to show data flow */}
                    <circle className="animate-pulse" cx="200" cy="80" r="3" fill="#FFAB2E" opacity="0.8"/>
                    <circle className="animate-pulse" cx="150" cy="150" r="3" fill="#0D6A51" opacity="0.8" style={{ animationDelay: '300ms' }}/>
                    <circle className="animate-pulse" cx="250" cy="150" r="3" fill="#0D6A51" opacity="0.8" style={{ animationDelay: '600ms' }}/>
                    <circle className="animate-pulse" cx="80" cy="240" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '900ms' }}/>
                    <circle className="animate-pulse" cx="200" cy="240" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '1200ms' }}/>
                    <circle className="animate-pulse" cx="320" cy="240" r="3" fill="#0EA5E9" opacity="0.8" style={{ animationDelay: '1500ms' }}/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* New MEREF Initiative Description */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-lg border border-amber-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#FFAB2E]/20 flex items-center justify-center text-[#FFAB2E] flex-shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">MEREF - Initiative Gouvernementale</h3>
              <p className="text-sm text-gray-600 mb-4">
                Le MEREF (Mécanisme de Refinancement et de Garantie) est une initiative développée par le Gouvernement du Mali 
                et le Fonds International de Développement Agricole (FIDA), à la suite du Programme Microfinance Rural (PMR). 
                À travers la plateforme N'GNA SÔRÔ!, le MEREF subventionne des institutions de microfinance (SFDs) afin que 
                celles-ci octroient des prêts via le système à des conditions avantageuses pour les populations rurales et urbaines.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-amber-50 p-3 rounded border border-amber-100">
                  <h4 className="font-medium text-amber-800">Subventionnement</h4>
                  <p className="text-amber-700 mt-1">Allocation stratégique des fonds aux SFDs selon les besoins régionaux</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-100">
                  <h4 className="font-medium text-green-800">Institutions SFD</h4>
                  <p className="text-green-700 mt-1">Distribution des prêts et services financiers aux bénéficiaires finaux</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                  <h4 className="font-medium text-blue-800">Plateforme N'GNA SÔRÔ!</h4>
                  <p className="text-blue-700 mt-1">Technologie facilitant le processus et permettant la transparence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureOverview;
