import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Building, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface Agency {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  sfdType: string;
  offersSavings: boolean;
  offersLoans: boolean;
  offersMobile: boolean;
  interestRates: {
    savings: number;
    shortTermLoan: number;
    longTermLoan: number;
  };
}

interface GeoAgencySelectorProps {
  onSelectAgency?: (agency: Agency) => void;
}

const GeoAgencySelector: React.FC<GeoAgencySelectorProps> = ({ onSelectAgency }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState<number[]>([50]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [sfdTypeFilter, setSfdTypeFilter] = useState<string[]>([]);
  const [servicesFilter, setServicesFilter] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock data for agencies with Mali-specific details
  const mockAgencies: Agency[] = [
    { 
      id: '1', 
      name: 'Agence Centrale Bamako', 
      address: '123 Avenue de l\'Indépendance, Bamako', 
      distance: 1.2, 
      lat: 12.65, 
      lng: -8.00,
      sfdType: 'Microfinance',
      offersSavings: true,
      offersLoans: true,
      offersMobile: true,
      interestRates: {
        savings: 3.5,
        shortTermLoan: 8.5,
        longTermLoan: 12.0
      }
    },
    { 
      id: '2', 
      name: 'Microfinance Sikasso', 
      address: '45 Rue du Commerce, Sikasso', 
      distance: 3.5, 
      lat: 11.31, 
      lng: -5.67,
      sfdType: 'Coopérative',
      offersSavings: true,
      offersLoans: true,
      offersMobile: false,
      interestRates: {
        savings: 4.0,
        shortTermLoan: 7.5,
        longTermLoan: 11.0
      }
    },
    { 
      id: '3', 
      name: 'SFD Mopti', 
      address: '78 Boulevard du Fleuve, Mopti', 
      distance: 5.7, 
      lat: 14.48, 
      lng: -4.18,
      sfdType: 'Banque communautaire',
      offersSavings: true,
      offersLoans: false,
      offersMobile: true,
      interestRates: {
        savings: 4.2,
        shortTermLoan: 9.0,
        longTermLoan: 13.5
      }
    },
    { 
      id: '4', 
      name: 'Centre Financier Ségou', 
      address: '90 Avenue Principale, Ségou', 
      distance: 8.1, 
      lat: 13.45, 
      lng: -6.26,
      sfdType: 'Microfinance',
      offersSavings: true,
      offersLoans: true,
      offersMobile: true,
      interestRates: {
        savings: 3.2,
        shortTermLoan: 8.0,
        longTermLoan: 11.5
      }
    },
    { 
      id: '5', 
      name: 'Banque Rurale Koulikoro', 
      address: '12 Zone Industrielle, Koulikoro', 
      distance: 25.3, 
      lat: 12.86, 
      lng: -7.56,
      sfdType: 'Banque communautaire',
      offersSavings: true,
      offersLoans: true,
      offersMobile: false,
      interestRates: {
        savings: 3.7,
        shortTermLoan: 7.8,
        longTermLoan: 10.5
      }
    },
    { 
      id: '6', 
      name: 'Microfinance Kayes', 
      address: '34 Route Nationale, Kayes', 
      distance: 42.7, 
      lat: 14.44, 
      lng: -11.44,
      sfdType: 'Coopérative',
      offersSavings: false,
      offersLoans: true,
      offersMobile: true,
      interestRates: {
        savings: 0,
        shortTermLoan: 6.5,
        longTermLoan: 9.5
      }
    }
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
      // Here we would initialize Mapbox with all agencies within the radius
    }
  }, [currentLocation, radius, mapRef.current]);

  const filteredAgencies = agencies
    .filter(agency => 
      agency.distance <= radius[0] &&
      (searchQuery === '' || 
        agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (sfdTypeFilter.length === 0 || sfdTypeFilter.includes(agency.sfdType)) &&
      (servicesFilter.length === 0 || 
        (servicesFilter.includes('savings') ? agency.offersSavings : true) &&
        (servicesFilter.includes('loans') ? agency.offersLoans : true) &&
        (servicesFilter.includes('mobile') ? agency.offersMobile : true))
    )
    .sort((a, b) => a.distance - b.distance);

  const selectAgency = (agency: Agency) => {
    setSelectedAgency(agency);
    if (onSelectAgency) {
      onSelectAgency(agency);
    }
    // Here we would center the map on the selected agency
  };

  const handleSfdTypeFilterChange = (type: string) => {
    setSfdTypeFilter(current => 
      current.includes(type) 
        ? current.filter(item => item !== type)
        : [...current, type]
    );
  };

  const handleServicesFilterChange = (service: string) => {
    setServicesFilter(current => 
      current.includes(service) 
        ? current.filter(item => item !== service)
        : [...current, service]
    );
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-primary" />
            Sélectionner votre agence SFD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une agence..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <label className="text-sm font-medium mb-2 block">Rayon de recherche: {radius[0]} km</label>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  value={radius}
                  onValueChange={setRadius}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Building className="h-4 w-4 mr-1" />
                      Type de SFD
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Type d'institution</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={sfdTypeFilter.includes('Microfinance')}
                      onCheckedChange={() => handleSfdTypeFilterChange('Microfinance')}
                    >
                      Microfinance
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sfdTypeFilter.includes('Coopérative')}
                      onCheckedChange={() => handleSfdTypeFilterChange('Coopérative')}
                    >
                      Coopérative
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sfdTypeFilter.includes('Banque communautaire')}
                      onCheckedChange={() => handleSfdTypeFilterChange('Banque communautaire')}
                    >
                      Banque communautaire
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Services
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Services offerts</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={servicesFilter.includes('savings')}
                      onCheckedChange={() => handleServicesFilterChange('savings')}
                    >
                      Épargne
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={servicesFilter.includes('loans')}
                      onCheckedChange={() => handleServicesFilterChange('loans')}
                    >
                      Prêts
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={servicesFilter.includes('mobile')}
                      onCheckedChange={() => handleServicesFilterChange('mobile')}
                    >
                      Services mobiles
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                  Carte de localisation des agences (rayon: {radius[0]} km)
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
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          {agency.name}
                          <Badge className="ml-2 text-xs bg-gray-100 text-gray-800">{agency.sfdType}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{agency.address}</div>
                        <div className="text-xs text-primary mt-1">à {agency.distance} km</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-green-600">Épargne: {agency.interestRates.savings}%</div>
                        <div className="text-amber-600">Prêt CT: {agency.interestRates.shortTermLoan}%</div>
                        <div className="text-blue-600">Prêt LT: {agency.interestRates.longTermLoan}%</div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {agency.offersSavings && (
                        <Badge variant="outline" className="text-xs">Épargne</Badge>
                      )}
                      {agency.offersLoans && (
                        <Badge variant="outline" className="text-xs">Prêts</Badge>
                      )}
                      {agency.offersMobile && (
                        <Badge variant="outline" className="text-xs">Mobile</Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredAgencies.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucune agence trouvée dans le rayon de {radius[0]} km
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
