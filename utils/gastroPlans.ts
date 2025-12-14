import { PlanTier } from '../types';

export const PLAN_CONFIG: Record<PlanTier, {
  price: number;
  label: string;
  description: string;
  features: string[];
  limits: {
    storage: number | 'unlimited'; // MB
    traffic: 'limited' | 'unlimited';
    support: 'limited' | 'unlimited';
  };
  modules: {
    restaurants: boolean;
    menus: boolean;
    reservations: boolean;
    customers: boolean;
    payments: boolean;
  }
}> = {
  basic: {
    price: 19.00,
    label: 'Basic',
    description: 'Essential menu management.',
    features: ['Menu Builder', 'Basic Support', 'Limited Traffic'],
    limits: { storage: 0, traffic: 'limited', support: 'limited' },
    modules: { restaurants: true, menus: true, reservations: false, customers: false, payments: false }
  },
  business: {
    price: 39.00,
    label: 'Business',
    description: 'For growing restaurants.',
    features: ['Reservations', '1GB Storage', 'Unlimited Support'],
    limits: { storage: 1024, traffic: 'limited', support: 'unlimited' },
    modules: { restaurants: true, menus: true, reservations: true, customers: false, payments: false }
  },
  corporate: {
    price: 69.00,
    label: 'Corporate',
    description: 'Scaling operations.',
    features: ['CRM / Customers', '10GB Storage', 'Unlimited Traffic'],
    limits: { storage: 10240, traffic: 'unlimited', support: 'unlimited' },
    modules: { restaurants: true, menus: true, reservations: true, customers: true, payments: false }
  },
  enterprise: {
    price: 99.00,
    label: 'Enterprise',
    description: 'Full automated platform.',
    features: ['Payments', 'Unlimited Storage', 'API Access'],
    limits: { storage: 'unlimited', traffic: 'unlimited', support: 'unlimited' },
    modules: { restaurants: true, menus: true, reservations: true, customers: true, payments: true }
  }
};

export const checkPermission = (plan: PlanTier, module: keyof typeof PLAN_CONFIG['basic']['modules']): boolean => {
  return PLAN_CONFIG[plan].modules[module];
};

export const getNextTier = (current: PlanTier): PlanTier | null => {
  const flow: PlanTier[] = ['basic', 'business', 'corporate', 'enterprise'];
  const idx = flow.indexOf(current);
  return idx < flow.length - 1 ? flow[idx + 1] : null;
};