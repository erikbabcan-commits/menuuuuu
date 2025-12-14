import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Builder } from './components/Builder';
import { Menu } from './types';

const STORAGE_KEY = 'lmb_menus';

const App: React.FC = () => {
  const [route, setRoute] = useState<'dashboard' | 'builder'>('dashboard');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMenus(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load menus', e);
      }
    }
  }, []);

  // Save to local storage whenever menus change
  useEffect(() => {
    if (menus.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    }
  }, [menus]);

  const handleCreate = () => {
    setActiveMenuId(null);
    setRoute('builder');
  };

  const handleEdit = (id: string) => {
    setActiveMenuId(id);
    setRoute('builder');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu?')) {
      const newMenus = menus.filter(m => m.id !== id);
      setMenus(newMenus);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMenus)); // Force save for delete
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

  if (route === 'builder') {
    const activeMenu = menus.find(m => m.id === activeMenuId);
    return (
      <Builder 
        menuId={activeMenuId} 
        onBack={() => setRoute('dashboard')} 
        onSave={handleSaveMenu}
        initialData={activeMenu}
      />
    );
  }

  return (
    <Dashboard 
      menus={menus} 
      onCreate={handleCreate} 
      onEdit={handleEdit} 
      onDelete={handleDelete}
    />
  );
};

export default App;
