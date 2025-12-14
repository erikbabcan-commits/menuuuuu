export type MenuTheme = 'glass' | 'dark' | 'light';
export type PlanTier = 'basic' | 'business' | 'corporate' | 'enterprise';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  depth: number; // 0 for root, 1 for child
  icon?: string;
}

export interface Menu {
  id: string;
  name: string;
  theme: MenuTheme;
  items: MenuItem[];
  createdAt: number;
}

export interface AiGeneratedItem {
  label: string;
  url: string;
  children?: AiGeneratedItem[];
}

export interface PlanFeature {
  id: string;
  label: string;
  unlockedAt: PlanTier;
}

export interface SubscriptionStats {
  storageUsed: number; // in MB
  storageLimit: number | 'unlimited'; // in MB
  trafficUsed: number; // monthly hits
  trafficLimit: number | 'unlimited';
}