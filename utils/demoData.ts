
import { Menu } from '../types';

export const DEMO_MENU: Menu = {
  id: 'demo-menu-01',
  name: 'Le Lumière • Ateliér',
  theme: 'dark',
  accentColor: 'gold',
  fontFamily: 'serif',
  borderRadius: 'full',
  heroImageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000',
  createdAt: Date.now(),
  // Add required activeLanguages property to fix TypeScript missing property error
  activeLanguages: ['sk', 'en'],
  items: [
    {
      id: 'sec-1',
      label: 'Signature Úvod',
      url: '#starters',
      depth: 0,
      icon: 'Star'
    },
    {
      id: 'item-1-1',
      label: 'Hríbové Velouté',
      description: 'Krémové pohladenie z divokých lesných húb s dotykom hľuzovkového oleja.',
      price: '24€',
      url: '#soup',
      depth: 1,
      icon: 'Coffee'
    },
    {
      id: 'item-1-2',
      label: 'Hrebenatky s kaviárom',
      description: 'Jemne orestované mušle sv. Jakuba so selekciou čierneho kaviáru Beluga.',
      price: '32€',
      url: '#scallops',
      depth: 1,
      icon: 'Sun'
    },
    {
      id: 'sec-2',
      label: 'Hlavná Symfónia',
      url: '#mains',
      depth: 0,
      icon: 'Menu'
    },
    {
      id: 'item-2-1',
      label: 'Wagyu A5 Ribeye',
      description: 'Najvyššia kvalita japonského mäsa s dokonalým mramorovaním a sezónnou zeleninou.',
      price: '120€',
      url: '#steak',
      depth: 1,
      icon: 'Heart'
    },
    {
      id: 'item-2-2',
      label: 'Homár Thermidor',
      description: 'Klasická francúzska receptúra s krémovou omáčkou, syrom a čerstvými bylinkami.',
      price: '85€',
      url: '#lobster',
      depth: 1,
      icon: 'Anchor'
    },
    {
      id: 'sec-3',
      label: 'Sladké Finále',
      url: '#desserts',
      depth: 0,
      icon: 'Moon'
    },
    {
      id: 'item-3-1',
      label: 'Zlatý Čokoládový Fondán',
      description: 'Tekuté jadro z 70% belgickej čokolády zdobené 24-karátovým zlatom.',
      price: '18€',
      url: '#dessert',
      depth: 1,
      icon: 'PenTool'
    }
  ]
};
