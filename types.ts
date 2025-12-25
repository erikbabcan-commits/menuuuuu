
export type MenuTheme = 'glass' | 'dark' | 'light' | 'neon';
export type PlanTier = 'basic' | 'business' | 'corporate' | 'enterprise';
export type AccentColor = 'indigo' | 'gold' | 'rose' | 'emerald' | 'slate';
export type FontFamily = 'serif' | 'sans' | 'montserrat' | 'playfair' | 'cormorant' | 'oswald';
export type MealTime = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'custom';
export type Language = 'sk' | 'en' | 'de';
export type ItemType = 'dish' | 'section';

export interface ScheduleConfig {
  type: MealTime;
  days: number[]; // 0 (Sunday) - 6 (Saturday)
  timeStart?: string; // HH:MM
  timeEnd?: string; // HH:MM
}

export interface MenuItem {
  id: string;
  type?: ItemType;
  label: string;
  description?: string;
  url: string;
  depth: number;
  icon?: string;
  price?: string;
  image?: string; 
  pairing?: string; // AI Sommelier recommendation
  isChefChoice?: boolean;
  isLimitedEdition?: boolean;
  dietaryTags?: string[];
  allergens?: string[];
  availability?: ScheduleConfig; // Changed from simple 'schedule' string
  translations?: Partial<Record<Language, { label: string; description?: string; pairing?: string }>>;
}

export interface Menu {
  id: string;
  name: string;
  theme: MenuTheme;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  baseFontSize?: number; // v pixeloch, napr. 16
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
  type?: ItemType;
  children?: AiGeneratedItem[];
}
