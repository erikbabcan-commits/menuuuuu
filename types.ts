
export type MenuTheme = 'glass' | 'dark' | 'light';
export type PlanTier = 'basic' | 'business' | 'corporate' | 'enterprise';
export type AccentColor = 'indigo' | 'gold' | 'rose' | 'emerald' | 'slate';
export type FontFamily = 'serif' | 'sans';
export type MealTime = 'all' | 'breakfast' | 'lunch' | 'dinner';
export type Language = 'sk' | 'en' | 'de';

export interface MenuItem {
  id: string;
  label: string;
  description?: string;
  url: string;
  depth: number;
  icon?: string;
  price?: string;
  isChefChoice?: boolean;
  isLimitedEdition?: boolean;
  dietaryTags?: ('vegan' | 'vegetarian' | 'paleo' | 'keto' | 'gluten-free')[];
  allergens?: string[];
  schedule?: MealTime;
  // Use Partial to allow providing translations for only some languages (e.g., just 'sk')
  translations?: Partial<Record<Language, { label: string; description?: string }>>;
}

export interface Menu {
  id: string;
  name: string;
  theme: MenuTheme;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  borderRadius: 'none' | 'md' | 'full';
  heroImageUrl?: string;
  items: MenuItem[];
  createdAt: number;
  publicUrl?: string;
  qrCodeUrl?: string;
  activeLanguages: Language[];
}

export interface AiGeneratedItem {
  label: string;
  description?: string;
  price?: string;
  url: string;
  children?: AiGeneratedItem[];
}

export interface AnalyticsData {
  views: number;
  topItems: { id: string; clicks: number }[];
  deviceBreakdown: { mobile: number; desktop: number };
  lastUpdated: number;
}
