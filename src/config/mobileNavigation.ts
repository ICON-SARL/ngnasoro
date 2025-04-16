
import { MobileMenuSection, MobileNavItem } from '@/types/navigation';

// Navigation principale (footer)
export const mobileNavItems: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: 'home',
    route: '/mobile-flow/main'
  },
  {
    id: 'funds',
    label: 'Mes fonds',
    icon: 'piggy-bank',
    route: '/mobile-flow/funds-management'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'user',
    route: '/mobile-flow/profile'
  }
];

// Menu principal avec sections
export const mobileMenuSections: MobileMenuSection[] = [
  {
    id: 'banking',
    title: 'Opérations bancaires',
    color: '#0D6A51',
    items: [
      {
        id: 'secure-payment',
        label: 'Paiement sécurisé',
        icon: 'shield-check',
        route: '/mobile-flow/secure-payment',
        color: '#0D6A51'
      },
      {
        id: 'scheduled-transfers',
        label: 'Transferts programmés',
        icon: 'calendar-clock',
        route: '/mobile-flow/schedule-transfer',
        color: '#0D6A51'
      },
      {
        id: 'multi-sfd',
        label: 'Gestion Multi-SFD',
        icon: 'building',
        route: '/mobile-flow/multi-sfd',
        color: '#0D6A51',
        coming: true
      },
      {
        id: 'advanced-security',
        label: 'Sécurité avancée',
        icon: 'shield-check',
        route: '/mobile-flow/secure-layer',
        color: '#0D6A51',
        coming: true
      }
    ]
  },
  {
    id: 'support',
    title: 'Support & Aide',
    color: '#6E59A5',
    items: [
      {
        id: 'contact-advisor',
        label: 'Contacter un conseiller',
        icon: 'message-square',
        route: '/mobile-flow/contact-advisor',
        color: '#6E59A5'
      },
      {
        id: 'faq',
        label: 'FAQ et assistance',
        icon: 'help-circle',
        route: '/mobile-flow/faq',
        color: '#6E59A5'
      },
      {
        id: 'search',
        label: 'Rechercher',
        icon: 'search',
        route: '/mobile-flow/search',
        color: '#6E59A5'
      }
    ]
  }
];
