
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Smartphone, Shield, Users, ArrowRight, CreditCard, BanknoteIcon, BarChart } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[#f8fafc] dark:bg-gray-950"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-[#0D6A51]/5 dark:bg-[#0D6A51]/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] rounded-full bg-[#FFAB2E]/5 dark:bg-[#FFAB2E]/10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-10 md:gap-16">
            <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
              <Badge className="mb-4 bg-[#0D6A51]/10 text-[#0D6A51] border-[#0D6A51]/20">
                MEREF - Système Financier Décentralisé
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
                <div className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mt-2 dark:text-gray-100">
                  Services financiers pour tous au Mali
                </div>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0">
                Une plateforme multi-SFD donnant accès aux services financiers décentralisés pour les populations rurales et urbaines du Mali.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Button 
                  onClick={() => navigate('/sfd-selector')}
                  className="h-12 px-8 rounded-md bg-[#0D6A51] text-white font-medium hover:bg-[#0D6A51]/90 transition-all transform hover:translate-y-[-2px]"
                >
                  Commencer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/mobile-flow')}
                  className="h-12 px-8 rounded-md border border-[#0D6A51]/20 bg-white text-[#0D6A51] font-medium hover:bg-[#0D6A51]/5 transition-all"
                >
                  Démo Mobile
                  <Smartphone className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="pt-6 flex items-center justify-center md:justify-start space-x-8">
                <div className="flex flex-col items-center md:items-start">
                  <div className="text-sm text-gray-500 dark:text-gray-400">SFDs</div>
                  <div className="text-xl font-bold text-[#0D6A51]">12+</div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col items-center md:items-start">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Utilisateurs</div>
                  <div className="text-xl font-bold text-[#0D6A51]">20K+</div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col items-center md:items-start">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Régions</div>
                  <div className="text-xl font-bold text-[#0D6A51]">8</div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-5/12 relative">
              <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-[#0D6A51]/20 to-[#FFAB2E]/20 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-white/30 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <img 
                  src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
                  alt="N'GNA SÔRÔ! Platform Screenshot" 
                  className="rounded-xl object-cover aspect-[4/3]"
                />
              </div>
              
              <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-[#0D6A51]/20 to-[#FFAB2E]/20 blur-2xl opacity-50 rounded-full transform scale-150"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-[#FFAB2E]/10 text-[#FFAB2E] border-[#FFAB2E]/20">
              Services Financiers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Services financiers adaptés à vos besoins
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Accédez à une gamme complète de services financiers décentralisés, sécurisés et facilement accessibles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll">
            {[
              {
                icon: <BanknoteIcon className="h-10 w-10 text-[#0D6A51]" />,
                title: "Épargne Sécurisée",
                description: "Ouvrez un compte d'épargne avec un taux d'intérêt attractif et des frais minimaux."
              },
              {
                icon: <CreditCard className="h-10 w-10 text-[#0D6A51]" />,
                title: "Microcrédits",
                description: "Accédez à des prêts adaptés à vos projets, avec des processus simplifiés et des taux avantageux."
              },
              {
                icon: <Smartphone className="h-10 w-10 text-[#0D6A51]" />,
                title: "Mobile Money",
                description: "Effectuez des transferts d'argent instantanés vers n'importe quel SFD ou opérateur mobile."
              },
              {
                icon: <Building className="h-10 w-10 text-[#0D6A51]" />,
                title: "Multi-SFD",
                description: "Gérez vos comptes dans différentes institutions financières à partir d'une seule application."
              },
              {
                icon: <Shield className="h-10 w-10 text-[#0D6A51]" />,
                title: "KYC Numérique",
                description: "Processus de vérification d'identité rapide et sécurisé, utilisable dans tout le réseau SFD."
              },
              {
                icon: <BarChart className="h-10 w-10 text-[#0D6A51]" />,
                title: "Suivi Financier",
                description: "Visualisez vos dépenses, revenus, et objectifs d'épargne avec des graphiques simples."
              }
            ].map((service, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-[#0D6A51]/10 p-3 w-fit mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/80 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Rejoignez le système financier moderne du Mali
            </h2>
            <p className="text-lg opacity-90">
              Créez votre compte, choisissez votre SFD et commencez à utiliser nos services financiers dès aujourd'hui.
            </p>
            <div className="pt-6">
              <Button onClick={() => navigate('/sfd-selector')}
                className="h-12 px-10 bg-white text-[#0D6A51] hover:bg-gray-100 rounded-full font-medium text-lg"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] border-[#0D6A51]/20">
              Avantages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Pourquoi choisir N'GNA SÔRÔ!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Une solution inclusive adaptée aux besoins financiers des Maliens, développée avec des technologies de pointe.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 animate-on-scroll">
            <div className="space-y-10">
              {[
                {
                  icon: <Users className="h-6 w-6 text-[#FFAB2E]" />,
                  title: "Inclusif et Accessible",
                  description: "Interface simplifiée disponible en français et en langues locales, utilisable même avec une connexion limitée."
                },
                {
                  icon: <Shield className="h-6 w-6 text-[#FFAB2E]" />,
                  title: "Sécurité Avancée",
                  description: "Authentification biométrique, chiffrement de bout en bout et conformité avec les réglementations bancaires."
                },
                {
                  icon: <Building className="h-6 w-6 text-[#FFAB2E]" />,
                  title: "Réseau SFD Étendu",
                  description: "Accès à un réseau croissant d'institutions financières à travers tout le Mali, même dans les zones rurales."
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="rounded-full bg-[#FFAB2E]/10 p-3 h-fit">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
              <img 
                src="/lovable-uploads/e8357419-009f-4b77-8913-c4e5bceddb72.png" 
                alt="Mobile Application Screenshot" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D6A51] text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <img 
                  src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
                  alt="NGNA SÔRÔ! Logo" 
                  className="h-10 w-auto"
                />
                <span className="font-bold text-lg">
                  <span className="text-[#FFAB2E]">N'GNA</span> SÔRÔ!
                </span>
              </div>
              <p className="text-sm text-white/80 mb-6">
                La plateforme financière décentralisée du Mali, rendant les services financiers accessibles à tous.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Comptes d'épargne</li>
                <li>Microcrédits</li>
                <li>Transferts d'argent</li>
                <li>Mobile Money</li>
                <li>KYC Numérique</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">SFDs Partenaires</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Nyèsigiso</li>
                <li>Kafo Jiginew</li>
                <li>Jemeni</li>
                <li>Soro Yiriwaso</li>
                <li>RMCR</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Bamako, Mali</li>
                <li>info@ngnasoro.ml</li>
                <li>+223 76 45 32 10</li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-white hover:text-[#FFAB2E] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#FFAB2E] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#FFAB2E] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-white/20 text-center text-sm text-white/60">
            <p>© 2023 N'GNA SÔRÔ! - MEREF. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
