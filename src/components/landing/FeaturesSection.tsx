
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Building, CircleDollarSign, Smartphone, Key } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="rounded-full bg-[#0D6A51]/10 p-3 w-fit mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-[#0D6A51]" />,
      title: "Inclusif et Accessible",
      description: "Interface adaptée et disponible en français et en langues locales, utilisable même avec une connexion limitée."
    },
    {
      icon: <Shield className="h-10 w-10 text-[#0D6A51]" />,
      title: "Sécurité Avancée",
      description: "Authentification sécurisée, chiffrement des données et conformité avec les réglementations bancaires du Mali."
    },
    {
      icon: <Building className="h-10 w-10 text-[#0D6A51]" />,
      title: "Réseau SFD Étendu",
      description: "Accès à un réseau d'institutions financières à travers tout le Mali, même dans les zones rurales."
    },
    {
      icon: <CircleDollarSign className="h-10 w-10 text-[#0D6A51]" />,
      title: "Transferts Économiques",
      description: "Frais de transfert réduits et processus optimisés pour économiser temps et argent."
    },
    {
      icon: <Smartphone className="h-10 w-10 text-[#0D6A51]" />,
      title: "Accessibilité Mobile",
      description: "Application conçue pour fonctionner sur tous types de téléphones, même avec une connectivité limitée."
    },
    {
      icon: <Key className="h-10 w-10 text-[#0D6A51]" />,
      title: "KYC Simplifié",
      description: "Processus d'identification simplifié et utilisable dans tout le réseau SFD partenaire."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] border-[#0D6A51]/20">
            Nos Avantages
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Pourquoi choisir N'GNA SÔRÔ!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Une solution inclusive adaptée aux besoins financiers des Maliens, développée avec des technologies de pointe.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
