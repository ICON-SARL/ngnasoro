import { MobileMenuSection, MobileNavItem } from '@/types/navigation';

// Navigation principale (footer) - Routes synchronisées
export const mobileNavItems: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: 'home',
    route: '/mobile-flow/dashboard'
  },
  {
    id: 'loans',
    label: 'Prêts',
    icon: 'credit-card',
    route: '/mobile-flow/loans'
  },
  {
    id: 'funds',
    label: 'Fonds',
    icon: 'wallet',
    route: '/mobile-flow/funds-management'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'user',
    route: '/mobile-flow/profile'
  }
];

// Menu principal avec sections - Routes actives uniquement
export const mobileMenuSections: MobileMenuSection[] = [
  {
    id: 'banking',
    title: 'Opérations bancaires',
    color: 'hsl(var(--primary))',
    items: [
      {
        id: 'vaults',
        label: 'Mes coffres',
        icon: 'vault',
        route: '/mobile-flow/vaults-hub',
        color: 'hsl(var(--primary))'
      },
      {
        id: 'accounts',
        label: 'Mes comptes',
        icon: 'building',
        route: '/mobile-flow/accounts',
        color: 'hsl(var(--primary))'
      },
      {
        id: 'loan-plans',
        label: 'Plans de prêt',
        icon: 'file-text',
        route: '/mobile-flow/loan-plans',
        color: 'hsl(var(--primary))'
      }
    ]
  },
  {
    id: 'support',
    title: 'Support & Aide',
    color: 'hsl(var(--accent))',
    items: [
      {
        id: 'faq',
        label: 'FAQ et assistance',
        icon: 'help-circle',
        route: '/mobile-flow/faq',
        color: 'hsl(var(--accent))'
      },
      {
        id: 'support',
        label: 'Support',
        icon: 'message-square',
        route: '/mobile-flow/support',
        color: 'hsl(var(--accent))'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'bell',
        route: '/mobile-flow/notifications',
        color: 'hsl(var(--accent))'
      }
    ]
  }
];
