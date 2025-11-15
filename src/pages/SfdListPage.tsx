import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Building2, Search, MapPin, Users, ChevronRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/skeleton-card';

const regions = [
  'Toutes',
  'Bamako',
  'Kayes',
  'Koulikoro',
  'Sikasso',
  'Ségou',
  'Mopti',
  'Tombouctou',
  'Gao',
  'Kidal'
];

export default function SfdListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');

  // Fetch SFDs from Supabase
  const { data: sfdPartners = [], isLoading, error } = useQuery({
    queryKey: ['active-sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredSfds = sfdPartners.filter(sfd => {
    const matchesSearch = sfd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sfd.region?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'Toutes' || sfd.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-24 pb-16 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5">
              <Building2 className="w-3 h-3 mr-1" />
              {sfdPartners.length} Institutions Partenaires
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nos SFD Partenaires
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les institutions de microfinance agréées par le MEREF,
              au service du développement économique du Mali
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une SFD ou une région..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-card/80 backdrop-blur-xl border-border/50 focus:border-primary/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-20 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {regions.map((region) => (
              <Button
                key={region}
                variant={selectedRegion === region ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion(region)}
                className="whitespace-nowrap"
              >
                {region}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Erreur de chargement
              </h3>
              <p className="text-muted-foreground mb-6">
                Impossible de charger les SFD. Veuillez réessayer.
              </p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </motion.div>
          ) : filteredSfds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Aucune SFD trouvée
              </h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedRegion('Toutes');
              }}>
                Réinitialiser les filtres
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSfds.map((sfd, index) => (
                <motion.div
                  key={sfd.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {sfd.logo_url ? (
                            <img
                              src={sfd.logo_url}
                              alt={sfd.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>`;
                              }}
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-foreground mb-1 truncate">
                            {sfd.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{sfd.region}</span>
                          </div>
                        </div>
                      </div>

                      {sfd.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {sfd.description}
                        </p>
                      )}

                      {sfd.clients_count && (
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-muted/50">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {formatNumber(sfd.clients_count)} clients
                          </span>
                        </div>
                      )}

                      {sfd.services && Array.isArray(sfd.services) && sfd.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {sfd.services.slice(0, 3).map((service: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {sfd.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{sfd.services.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {(sfd.phone || sfd.contact_email) && (
                        <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                          {sfd.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>{sfd.phone}</span>
                            </div>
                          )}
                          {sfd.contact_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{sfd.contact_email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                        variant="outline"
                        onClick={() => navigate('/sfd-selection')}
                      >
                        Choisir cette SFD
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Votre SFD n'est pas listée ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contactez le MEREF pour devenir partenaire officiel de N'GNASÔRÔ
            </p>
            <Button size="lg" onClick={() => navigate('/contact')}>
              Nous contacter
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
