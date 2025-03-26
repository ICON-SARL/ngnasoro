
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Agency {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
}

const GeoAgencySelector = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock data for agencies
  const mockAgencies: Agency[] = [
    { id: '1', name: 'Agence Centrale Bamako', address: '123 Rue du Commerce, Bamako', distance: 1.2, lat: 12.65, lng: -8.00 },
    { id: '2', name: 'Microfinance Sikasso', address: '45 Avenue Principale, Sikasso', distance: 3.5, lat: 11.31, lng: -5.67 },
    { id: '3', name: 'SFD Mopti', address: '78 Boulevard Rivière, Mopti', distance: 5.7, lat: 14.48, lng: -4.18 },
    { id: '4', name: 'Centre Financier Ségou', address: '90 Rue du Marché, Ségou', distance: 8.1, lat: 13.45, lng: -6.26 }
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
          // In a real app, we would fetch agencies near this location
          setAgencies(mockAgencies);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          setAgencies(mockAgencies); // Fallback to all agencies
        }
      );
    } else {
      setAgencies(mockAgencies); // Fallback if geolocation is not available
    }
  }, []);

  useEffect(() => {
    // This would initialize Mapbox in a real implementation
    if (mapRef.current && currentLocation) {
      console.log('Initializing map at', currentLocation);
      // Here we would initialize Mapbox
    }
  }, [currentLocation, mapRef.current]);

  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectAgency = (agency: Agency) => {
    setSelectedAgency(agency);
    // Here we would center the map on the selected agency
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-primary" />
            Sélectionner votre agence SFD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une agence..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Localisation en cours...</span>
            </div>
          ) : (
            <>
              <div className="h-64 bg-muted rounded-md mb-4" ref={mapRef}>
                {/* Mapbox would be initialized here in a real implementation */}
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Carte de localisation des agences
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAgencies.map(agency => (
                  <div 
                    key={agency.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedAgency?.id === agency.id 
                        ? 'bg-primary/10 border border-primary' 
                        : 'hover:bg-secondary border border-transparent'
                    }`}
                    onClick={() => selectAgency(agency)}
                  >
                    <div className="font-medium">{agency.name}</div>
                    <div className="text-sm text-muted-foreground">{agency.address}</div>
                    <div className="text-xs text-primary mt-1">à {agency.distance} km</div>
                  </div>
                ))}
                
                {filteredAgencies.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucune agence trouvée
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button disabled={!selectedAgency}>
              Confirmer la sélection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoAgencySelector;
