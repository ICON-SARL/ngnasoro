import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const sfdPartners = [
  {
    id: 1,
    name: 'Kafo Jiginew',
    region: 'Sikasso',
    clients: '250K+',
    services: ['Micro-crédit', 'Épargne', 'Assurance'],
    logo: '🏦',
  },
  {
    id: 2,
    name: 'Nyèsigiso',
    region: 'Ségou',
    clients: '180K+',
    services: ['Crédit agricole', 'Épargne', 'Mobile Money'],
    logo: '🌾',
  },
  {
    id: 3,
    name: 'Soro Yiriwaso',
    region: 'Bamako',
    clients: '120K+',
    services: ['Micro-crédit', 'Transferts', 'Coffres'],
    logo: '💼',
  },
  {
    id: 4,
    name: 'Jemeni',
    region: 'Kayes',
    clients: '95K+',
    services: ['Épargne', 'Crédit habitat', 'Assurance'],
    logo: '🏠',
  },
  {
    id: 5,
    name: 'Kokari',
    region: 'Mopti',
    clients: '75K+',
    services: ['Micro-crédit', 'Épargne', 'Formation'],
    logo: '📚',
  },
  {
    id: 6,
    name: 'Faso Kanu',
    region: 'Koulikoro',
    clients: '60K+',
    services: ['Crédit artisanal', 'Épargne', 'Groupe solidaire'],
    logo: '🎨',
  },
];

const regions = ['Toutes', 'Bamako', 'Sikasso', 'Ségou', 'Kayes', 'Mopti', 'Koulikoro'];

const SfdListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');
  const navigate = useNavigate();

  const filteredSfds = sfdPartners.filter((sfd) => {
    const matchesSearch = sfd.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'Toutes' || sfd.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🇲🇱 Réseau national MEREF
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos Partenaires SFD
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Découvrez les Structures Financières Décentralisées agréées par le MEREF
              qui accompagnent les Maliens dans leur développement financier.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une SFD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-white text-gray-900 border-0 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {regions.map((region) => (
              <Button
                key={region}
                variant={selectedRegion === region ? 'default' : 'outline'}
                onClick={() => setSelectedRegion(region)}
                className={`rounded-xl whitespace-nowrap ${
                  selectedRegion === region
                    ? 'bg-[#0D6A51] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {region}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* SFD Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSfds.map((sfd, index) => (
              <motion.div
                key={sfd.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border-gray-200 hover:border-[#0D6A51]/20 overflow-hidden">
                  <CardContent className="p-6">
                    {/* Logo & Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D6A51] to-[#176455] flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                        {sfd.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {sfd.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {sfd.region}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                      <Users className="w-4 h-4 text-[#0D6A51]" />
                      <span className="text-sm font-medium text-gray-700">
                        {sfd.clients} clients
                      </span>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sfd.services.map((service) => (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="bg-[#0D6A51]/10 text-[#0D6A51] border-0"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => navigate('/sfd-selection')}
                      className="w-full bg-[#0D6A51] hover:bg-[#176455] text-white rounded-xl"
                    >
                      Choisir cette SFD
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredSfds.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Aucune SFD trouvée</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Votre SFD n'est pas listée ?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Nous travaillons continuellement à élargir notre réseau de partenaires.
          </p>
          <Button
            onClick={() => navigate('/contact')}
            size="lg"
            className="h-14 px-8 rounded-2xl bg-white text-[#0D6A51] hover:bg-white/90 font-semibold"
          >
            Nous contacter
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SfdListPage;
