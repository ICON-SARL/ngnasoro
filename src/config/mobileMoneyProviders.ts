
import orangeMoneyLogo from '@/assets/providers/orange-money.png';
import mtnMomoLogo from '@/assets/providers/mtn-momo.png';
import moovMoneyLogo from '@/assets/providers/moov-money.png';
import waveLogo from '@/assets/providers/wave.png';

export interface MobileMoneyProviderConfig {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export const mobileMoneyProviders: MobileMoneyProviderConfig[] = [
  { 
    id: 'orange', 
    name: 'Orange Money', 
    shortName: 'Orange',
    logo: orangeMoneyLogo,
  },
  { 
    id: 'mtn', 
    name: 'MTN MoMo', 
    shortName: 'MTN',
    logo: mtnMomoLogo,
  },
  { 
    id: 'moov', 
    name: 'Moov Money', 
    shortName: 'Moov',
    logo: moovMoneyLogo,
  },
  { 
    id: 'wave', 
    name: 'Wave', 
    shortName: 'Wave',
    logo: waveLogo,
  },
];
