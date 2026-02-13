import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Search, MapPin, Users, ChevronRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonCard } from '@/components/ui/skeleton-card';

const regions = [
  'Toutes', 'Bamako', 'Kayes', 'Koulikoro', 'Sikasso',
  'Ségou', 'Mopti', 'Tombouctou', 'Gao', 'Kidal'
];

export default function SfdListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');

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

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="pt-24 pb-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D6A51]/8 text-[#0D6A51] text-xs font-medium mb-4">
            <Building2 className="w-3 h-3" />
            {sfdPartners.length} Institutions Partenaires
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Nos SFD Partenaires
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Institutions de microfinance agréées par le MEREF
          </p>

          <div className="mt-6 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une SFD ou région..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 text-sm bg-gray-50 border-gray-200 rounded-2xl focus:border-[#0D6A51]/50 focus:ring-[#0D6A51]/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Region filters */}
      <section className="sticky top-20 z-30 bg-white border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory no-scrollbar">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`snap-start flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedRegion === region
                    ? 'bg-[#0D6A51] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white pointer-events-none" />
        </div>
      </section>

      {/* SFD Cards */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Erreur de chargement</h3>
              <p className="text-sm text-gray-500 mb-4">Impossible de charger les SFD.</p>
              <Button size="sm" onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
          ) : filteredSfds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune SFD trouvée</h3>
              <p className="text-sm text-gray-500 mb-4">Modifiez vos critères de recherche</p>
              <Button size="sm" variant="outline" onClick={() => { setSearchQuery(''); setSelectedRegion('Toutes'); }}>
                Réinitialiser
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSfds.map((sfd) => (
                <div
                  key={sfd.id}
                  className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {sfd.logo_url ? (
                        <img
                          src={sfd.logo_url}
                          alt={sfd.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-6 h-6 text-[#0D6A51]"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></div>';
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-[#0D6A51]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {sfd.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{sfd.region}</span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-medium text-[#0D6A51] bg-[#0D6A51]/8 px-2 py-0.5 rounded-full">
                      Agréé MEREF
                    </span>
                  </div>

                  {sfd.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{sfd.description}</p>
                  )}

                  {sfd.clients_count && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5 text-[#0D6A51]" />
                      <span className="font-medium">{formatNumber(sfd.clients_count)} clients</span>
                    </div>
                  )}

                  {sfd.services && Array.isArray(sfd.services) && sfd.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {sfd.services.slice(0, 3).map((service: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg">
                          {service}
                        </span>
                      ))}
                      {sfd.services.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-400 rounded-lg">
                          +{sfd.services.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {(sfd.phone || sfd.contact_email) && (
                    <div className="space-y-1 mb-3 text-xs text-gray-500">
                      {sfd.phone && (
                        <a href={`tel:${sfd.phone}`} className="flex items-center gap-1.5 hover:text-[#0D6A51]">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{sfd.phone}</span>
                        </a>
                      )}
                      {sfd.contact_email && (
                        <a href={`mailto:${sfd.contact_email}`} className="flex items-center gap-1.5 hover:text-[#0D6A51]">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{sfd.contact_email}</span>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="mt-auto">
                    <button
                      onClick={() => navigate('/sfd-selection', { state: { selectedSfdId: sfd.id } })}
                      className="w-full py-2.5 rounded-xl bg-[#0D6A51] text-white text-sm font-medium hover:bg-[#0B5A44] transition-colors flex items-center justify-center gap-1"
                    >
                      Choisir cette SFD
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Votre SFD n'est pas listée ?
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Contactez le MEREF pour devenir partenaire
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/contact')}
            className="bg-[#0D6A51] hover:bg-[#0B5A44] text-white"
          >
            Nous contacter
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
