import { MobileNavItem, MobileMenuSection, MobileMenuItem } from '@/types/navigation';

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
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'User',
    route: '/mobile-flow/profile'
  }
];

export const mobileMenuSections: MobileMenuSection[] = [
  {
    id: 'main',
    title: 'Menu principal',
    color: '#0D6A51',
    items: [
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
    ]
  },
  {
    id: 'account',
    title: 'Mon compte',
    color: '#4A5568',
    items: [
      {
        id: 'profile',
        label: 'Profil',
        icon: 'User',
        route: '/mobile-flow/profile'
      },
      {
        id: 'settings',
        label: 'Paramètres',
        icon: 'Settings',
        route: '/mobile-flow/settings'
      },
      {
        id: 'help',
        label: 'Aide',
        icon: 'HelpCircle',
        route: '/mobile-flow/help'
      }
    ]
  }
];
