
import { MobileNavItem } from '@/types/navigation';

export const mobileNavItems: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: 'Home',
    route: '/mobile-flow/main'
  },
  {
    id: 'loans',
    label: 'Prêts',
    icon: 'CreditCard',
    route: '/mobile-flow/loans'
  },
  {
    id: 'my-loans',
    label: 'Mes prêts',
    icon: 'FileText',
    route: '/mobile-flow/my-loans'
  },
  {
    id: 'funds',
    label: 'Mes fonds',
    icon: 'Wallet',
    route: '/mobile-flow/funds'
  }
];
