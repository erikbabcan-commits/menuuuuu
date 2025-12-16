import { Menu } from '../types';

export const DEMO_MENU: Menu = {
  id: 'demo-menu-01',
  name: 'Le Lumière • Večera',
  theme: 'dark',
  createdAt: Date.now(),
  items: [
    {
      id: 'sec-1',
      label: 'Úvod',
      url: '#starters',
      depth: 0,
      icon: 'Star'
    },
    {
      id: 'item-1-1',
      label: 'Hríbové Velouté - 24€',
      url: '#soup',
      depth: 1,
      icon: 'Coffee'
    },
    {
      id: 'item-1-2',
      label: 'Hrebenatky s Hľuzovkou - 32€',
      url: '#scallops',
      depth: 1,
      icon: 'Sun'
    },
    {
      id: 'sec-2',
      label: 'Hlavné Chody',
      url: '#mains',
      depth: 0,
      icon: 'Menu'
    },
    {
      id: 'item-2-1',
      label: 'Wagyu A5 Ribeye - 120€',
      url: '#steak',
      depth: 1,
      icon: 'Heart'
    },
    {
      id: 'item-2-2',
      label: 'Homár Thermidor - 85€',
      url: '#lobster',
      depth: 1,
      icon: 'Anchor'
    },
    {
      id: 'sec-3',
      label: 'Výber Someliéra',
      url: '#wine',
      depth: 0,
      icon: 'Moon'
    },
    {
      id: 'item-3-1',
      label: 'Château Margaux 2015',
      url: '#red',
      depth: 1,
      icon: 'PenTool'
    }
  ]
};