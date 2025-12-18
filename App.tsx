
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Builder } from './components/Builder';
import { Menu, PlanTier } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getNextTier } from './utils/gastroPlans';
import { DEMO_MENU } from './utils/demoData';

const STORAGE_KEY = 'lmb_menus';
const PLAN_STORAGE_KEY = 'lmb_plan';

const App: React.FC = () => {
  const [route, setRoute] = useState<'dashboard' | 'builder'>('dashboard');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Nastavíme predvolený plán na 'enterprise', aby boli všetky funkcie dostupné po odstránení loginu
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('enterprise');

  useEffect(() => {
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    if (savedMenus) {
      try {
        const parsed = JSON.parse(savedMenus);
        setMenus(parsed);
      } catch (e) {
        console.error('Failed to load menus', e);
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

  const handleCreate = () => {
    setActiveMenuId(null);
    setRoute('builder');
  };

  const handleEdit = (id: string) => {
    setActiveMenuId(id);
    setRoute('builder');
  };

  const handleDelete = (id: string) => {
    if (confirm('Naozaj chcete vymazať toto menu?')) {
      const newMenus = menus.filter(m => m.id !== id);
      setMenus(newMenus);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMenus));
    }
  };

  const handleSaveMenu = (menu: Menu) => {
    setMenus(prev => {
      const existing = prev.findIndex(m => m.id === menu.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = menu;
        return copy;
      }
      return [...prev, menu];
    });
    setRoute('dashboard');
  };
  
  const handleUpgrade = () => {
     const next = getNextTier(currentPlan);
     if (next) {
       if(confirm(`Simulovať platbu a inovovať na balík ${next.toUpperCase()}?`)) {
         setCurrentPlan(next);
       }
     } else {
       alert("Máte najvyšší balík!");
     }
  };

  const handleRestoreDemo = () => {
    setMenus([DEMO_MENU]);
  };

  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      <div className="h-dvh w-full overflow-hidden bg-slate-50 relative">
        {route === 'builder' ? (
          <Builder 
            menuId={activeMenuId} 
            onBack={() => setRoute('dashboard')} 
            onSave={handleSaveMenu}
            initialData={menus.find(m => m.id === activeMenuId)}
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
          />
        ) : (
          <Dashboard 
            menus={menus} 
            onCreate={handleCreate} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
            onRestoreDemo={handleRestoreDemo}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
