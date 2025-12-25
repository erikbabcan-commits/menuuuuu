import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { Builder } from './components/Builder';
import { Menu, PlanTier } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast, ToastType } from './components/ui/Toast';
import { getNextTier } from './utils/gastroPlans';
import { DEMO_MENU } from './utils/demoData';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'lmb_menus';
const PLAN_STORAGE_KEY = 'lmb_plan';

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [route, setRoute] = useState<'dashboard' | 'builder'>('dashboard');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('enterprise');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Hydration
  useEffect(() => {
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    if (savedMenus) {
      try {
        setMenus(JSON.parse(savedMenus));
      } catch (e) {
        console.error('Failed to load menus', e);
        setMenus([DEMO_MENU]);
      }
    } else {
      setMenus([DEMO_MENU]);
    }

    const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
    if (savedPlan) {
      setCurrentPlan(savedPlan as PlanTier);
    }

    setIsLoaded(true);
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    }
  }, [menus, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PLAN_STORAGE_KEY, currentPlan);
    }
  }, [currentPlan, isLoaded]);

  const handleCreate = useCallback(() => {
    setActiveMenuId(null);
    setRoute('builder');
  }, []);

  const handleEdit = useCallback((id: string) => {
    setActiveMenuId(id);
    setRoute('builder');
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMenus(prev => prev.filter(m => m.id !== id));
    showToast('Menu bolo úspešne vymazané.', 'info');
  }, [showToast]);

  const handleSaveMenu = useCallback((menu: Menu) => {
    setMenus(prev => {
      const idx = prev.findIndex(m => m.id === menu.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = menu;
        return next;
      }
      return [...prev, menu];
    });
    setRoute('dashboard');
    showToast('Váš dizajn bol úspešne uložený do cloudu.');
  }, [showToast]);
  
  const handleUpgrade = useCallback(() => {
     const next = getNextTier(currentPlan);
     if (next) {
        setCurrentPlan(next);
        showToast(`Váš účet bol úspešne inovovaný na balík ${next.toUpperCase()}!`, 'success');
     } else {
        showToast('Máte aktivovaný najvyšší Enterprise plán.', 'info');
     }
  }, [currentPlan, showToast]);

  const handleRestoreDemo = useCallback(() => {
    setMenus([DEMO_MENU]);
    showToast('Ukážkové dáta boli obnovené.');
  }, [showToast]);

  // Optimized lookup for active menu
  const activeMenu = useMemo(() => 
    menus.find(m => m.id === activeMenuId),
  [menus, activeMenuId]);

  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      <div className="h-dvh w-full overflow-hidden bg-slate-50 relative">
        <AnimatePresence mode="wait">
          {route === 'builder' ? (
            <MotionDiv
              key="builder"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              <Builder 
                menuId={activeMenuId} 
                onBack={() => setRoute('dashboard')} 
                onSave={handleSaveMenu}
                initialData={activeMenu}
                currentPlan={currentPlan}
                onUpgrade={handleUpgrade}
              />
            </MotionDiv>
          ) : (
            <MotionDiv
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              <Dashboard 
                menus={menus} 
                onCreate={handleCreate} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                currentPlan={currentPlan}
                onUpgrade={handleUpgrade}
                onRestoreDemo={handleRestoreDemo}
              />
            </MotionDiv>
          )}
        </AnimatePresence>

        <Toast 
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;