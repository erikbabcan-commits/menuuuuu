import React, { useState } from 'react';
import { Menu, MenuItem } from '../types';
import { Menu as MenuIcon, X, ChevronDown, ArrowRight } from 'lucide-react';

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
    glass: "bg-white/70 backdrop-blur-2xl border-b border-white/20 text-slate-900 shadow-sm supports-[backdrop-filter]:bg-white/40",
    dark: "bg-slate-950/95 backdrop-blur-xl text-white border-b border-white/5 shadow-2xl",
    light: "bg-white/95 backdrop-blur-xl text-slate-900 border-b border-slate-100 shadow-sm"
  };

  const dropdownClasses = {
    glass: "bg-white/80 backdrop-blur-2xl border border-white/40 text-slate-900 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]",
    dark: "bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl",
    light: "bg-white border border-slate-100 text-slate-900 shadow-xl"
  };

  const mobileMenuClasses = {
    glass: "bg-white/95 backdrop-blur-2xl",
    dark: "bg-slate-950",
    light: "bg-white"
  };

  const heroTextClasses = {
    glass: "text-slate-800",
    dark: "text-white",
    light: "text-slate-900"
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100 font-sans">
      {/* Background with Mesh Gradient for Premium Feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-slate-100 to-emerald-50 opacity-80" />
      
      {/* Mock Website Content - Hero Section */}
      <div className="absolute inset-0 pt-24 px-8 md:px-12 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <div className={`space-y-6 max-w-2xl transform transition-all duration-700 ease-out ${heroTextClasses[menu.theme]}`}>
          <div className="inline-block px-3 py-1 rounded-full border border-current opacity-30 text-xs font-bold tracking-widest uppercase mb-4">
            Collection 2025
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight tracking-tight">
            Redefining <br/>
            <span className="italic opacity-80">Digital Luxury.</span>
          </h1>
          <p className="text-sm md:text-base opacity-70 font-light leading-relaxed max-w-md mx-auto">
            Experience the harmony of form and function. This preview demonstrates your menu's integration with high-end aesthetic layouts.
          </p>
          <div className="pt-8 flex justify-center gap-4">
            <div className="h-12 w-40 bg-current opacity-10 rounded-full" />
            <div className="h-12 w-40 border border-current opacity-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* The Menu */}
      <nav className={`absolute top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${themeClasses[menu.theme]}`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="font-serif font-bold text-2xl tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-current rounded-full opacity-20" />
            {menu.name || 'Luxe.'}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {structure.map((item) => (
              <div key={item.id} className="relative group perspective-1000">
                <a 
                  href={item.url} 
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:bg-current hover:bg-opacity-5 flex items-center gap-1.5 tracking-wide opacity-90 hover:opacity-100"
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDown className="w-3 h-3 opacity-50 transition-transform group-hover:rotate-180" />}
                </a>
                
                {/* Dropdown */}
                {item.children.length > 0 && (
                  <div className={`absolute top-full left-0 mt-2 w-56 rounded-2xl py-3 opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 origin-top-left z-50 ${dropdownClasses[menu.theme]}`}>
                    {item.children.map((child, idx) => (
                      <a 
                        key={child.id}
                        href={child.url}
                        className="flex items-center justify-between px-6 py-2.5 text-sm hover:opacity-60 transition-all duration-200 group/link"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        {child.label}
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* CTA Button Mock */}
            <div className="ml-6 pl-6 border-l border-current border-opacity-10">
               <button className="px-6 py-2 bg-current text-white dark:text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                 Book
               </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 rounded-full hover:bg-current hover:bg-opacity-10 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileOpen && (
          <div className={`md:hidden absolute top-20 left-0 right-0 h-[calc(100vh-5rem)] p-8 overflow-y-auto ${mobileMenuClasses[menu.theme]} animate-in slide-in-from-top-4 duration-300`}>
            <div className="flex flex-col space-y-4">
              {menu.items.map((item, idx) => (
                <div 
                  key={item.id}
                  className="animate-in slide-in-from-bottom-2 fade-in duration-500"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <a 
                    href={item.url}
                    className={`
                      block py-3 text-2xl font-serif font-medium border-b border-current border-opacity-10
                      ${item.depth > 0 ? 'ml-6 text-lg opacity-70 border-none py-2 font-sans' : ''} 
                    `}
                  >
                    {item.label}
                  </a>
                </div>
              ))}
              
              <div className="pt-8 mt-4">
                 <button className="w-full py-4 bg-current text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest">
                   Get Started
                 </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};