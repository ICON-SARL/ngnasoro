
export interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export interface MobileMenuSection {
  id: string;
  title: string;
  color: string;
  items: MobileMenuItem[];
}

export interface MobileMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
  color?: string;
  coming?: boolean;
}
