
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BanknoteIcon, CreditCard, Smartphone, Building, Shield, BarChart } from 'lucide-react';

const ServicesSection = () => {
  const services = [
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
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900">
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
          {services.map((service, index) => (
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
  );
};

export default ServicesSection;
