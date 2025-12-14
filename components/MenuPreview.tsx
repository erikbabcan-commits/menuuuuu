import React, { useState } from 'react';
import { Menu, MenuItem } from '../types';
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';

interface MenuPreviewProps {
  menu: Menu;
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Group items into parent-child structure for rendering
  const structure = React.useMemo(() => {
    const roots: (MenuItem & { children: MenuItem[] })[] = [];
    let currentRoot: (MenuItem & { children: MenuItem[] }) | null = null;

    menu.items.forEach(item => {
      if (item.depth === 0) {
        currentRoot = { ...item, children: [] };
        roots.push(currentRoot);
      } else if (currentRoot && item.depth === 1) {
        currentRoot.children.push(item);
      }
    });
    return roots;
  }, [menu.items]);

  const themeClasses = {
    glass: "bg-white/40 backdrop-blur-xl border-b border-white/30 text-slate-800 shadow-sm",
    dark: "bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md",
    light: "bg-white text-slate-900 border-b border-slate-100 shadow-sm"
  };

  const dropdownClasses = {
    glass: "bg-white/60 backdrop-blur-xl border border-white/30 text-slate-800 shadow-xl",
    dark: "bg-slate-800 text-slate-100 border border-slate-700 shadow-xl",
    light: "bg-white text-slate-900 border border-slate-100 shadow-xl"
  };

  const mobileMenuClasses = {
    glass: "bg-white/80 backdrop-blur-2xl",
    dark: "bg-slate-900",
    light: "bg-white"
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Fake Website Content Background */}
      <div className="absolute inset-0 p-8 pt-24 overflow-y-auto opacity-50 pointer-events-none select-none">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-64 bg-slate-300/50 rounded-2xl w-full animate-pulse" />
          <div className="grid grid-cols-3 gap-8">
            <div className="h-40 bg-slate-300/50 rounded-xl animate-pulse" />
            <div className="h-40 bg-slate-300/50 rounded-xl animate-pulse" />
            <div className="h-40 bg-slate-300/50 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
             <div className="h-4 bg-slate-300/50 rounded w-3/4" />
             <div className="h-4 bg-slate-300/50 rounded w-1/2" />
             <div className="h-4 bg-slate-300/50 rounded w-full" />
          </div>
        </div>
      </div>

      {/* The Menu */}
      <nav className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${themeClasses[menu.theme]}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="font-serif font-bold text-xl tracking-tight">
            {menu.name || 'Brand'}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {structure.map((item) => (
              <div key={item.id} className="relative group">
                <a 
                  href={item.url} 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-70 flex items-center gap-1"
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDown className="w-3 h-3 opacity-50" />}
                </a>
                
                {/* Dropdown */}
                {item.children.length > 0 && (
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-xl py-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ${dropdownClasses[menu.theme]}`}>
                    {item.children.map(child => (
                      <a 
                        key={child.id}
                        href={child.url}
                        className="block px-4 py-2 text-sm hover:opacity-60 transition-opacity"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-black/5"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileOpen && (
          <div className={`md:hidden absolute top-16 left-0 right-0 h-[calc(100vh-4rem)] p-6 overflow-y-auto ${mobileMenuClasses[menu.theme]}`}>
            <div className="flex flex-col space-y-2">
              {menu.items.map((item) => (
                <a 
                  key={item.id}
                  href={item.url}
                  className={`block px-4 py-3 rounded-lg text-lg font-medium transition-colors ${item.depth > 0 ? 'ml-6 opacity-80 text-base' : ''} hover:bg-black/5`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
