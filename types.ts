export type MenuTheme = 'glass' | 'dark' | 'light';

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
