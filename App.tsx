import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Builder } from './components/Builder';
import { Menu, PlanTier } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getNextTier } from './utils/gastroPlans';
import { DevLockScreen } from './components/DevLockScreen';
import { DEMO_MENU } from './utils/demoData';

const STORAGE_KEY = 'lmb_menus';
const PLAN_STORAGE_KEY = 'lmb_plan';
const DEV_AUTH_KEY = 'lmb_dev_auth';

const App: React.FC = () => {
  const [route, setRoute] = useState<'dashboard' | 'builder'>('dashboard');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Plan state with persistence
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('basic');
  
  // Developer Lock State - Lazy initialization to prevent flash
  const [showDevLock, setShowDevLock] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const auth = localStorage.getItem(DEV_AUTH_KEY);
        return auth !== 'true';
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  });

  // Load from local storage on mount
  useEffect(() => {
    // Load Menus
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    if (savedMenus) {
      try {
        const parsed = JSON.parse(savedMenus);
        // If array is empty (user deleted everything), that's fine.
        // If key didn't exist at all (null), we inject demo.
        setMenus(parsed);
      } catch (e) {
        console.error('Failed to load menus', e);
      }
    } else {
      // First time user experience: Inject Demo Data
      setMenus([DEMO_MENU]);
    }

    // Load Plan
    const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
    if (savedPlan) {
      setCurrentPlan(savedPlan as PlanTier);
    }

    setIsLoaded(true);
  }, []);

  // Save Menus to local storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    }
  }, [menus, isLoaded]);

  // Save Plan to local storage whenever it changes
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

  // Auth Handlers
  const handleDevUnlock = () => {
    localStorage.setItem(DEV_AUTH_KEY, 'true');
    setCurrentPlan('enterprise'); // Auto-upgrade to max tier
    setShowDevLock(false);
  };

  const handleGuestAccess = () => {
    setShowDevLock(false);
    // Keep existing plan or default to basic
  };

  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      {showDevLock ? (
        <DevLockScreen onUnlock={handleDevUnlock} onGuest={handleGuestAccess} />
      ) : (
        <>
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
        </>
      )}
    </ErrorBoundary>
  );
};

export default App;