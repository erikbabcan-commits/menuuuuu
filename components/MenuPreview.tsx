import React, { useState } from 'react';
import { Menu, MenuItem } from '../types';
import { Menu as MenuIcon, X, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { iconMap } from '../utils/icons';
import { themeStyles } from '../utils/themeStyles';

interface MenuPreviewProps {
  menu: Menu;
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const currentTheme = themeStyles[menu.theme] || themeStyles.glass;

  // Animation Variants
  const dropdownVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 8, 
      scale: 0.96,
      filter: "blur(4px)",
      transition: { duration: 0.2, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.3, 
        ease: [0.23, 1, 0.32, 1], // Cubic bezier for fluid motion
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: 4, 
      scale: 0.98,
      filter: "blur(2px)",
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } }
  };

  const mobileContainerVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "calc(100vh - 5rem)",
      transition: { 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const mobileItemVariants: Variants = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100 font-sans select-none">
      {/* Background with Mesh Gradient for Premium Feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-slate-100 to-emerald-50 opacity-80" />
      
      {/* Mock Website Content - Hero Section */}
      <div className="absolute inset-0 pt-24 px-8 md:px-12 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`space-y-6 max-w-2xl ${currentTheme.heroText}`}
        >
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
        </motion.div>
      </div>

      {/* The Menu */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`absolute top-0 left-0 right-0 z-50 transition-colors duration-500 ${currentTheme.nav}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="font-serif font-bold text-2xl tracking-tighter flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-current rounded-full opacity-20" />
            {menu.name || 'Luxe.'}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {structure.map((item) => {
               const ItemIcon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
               return (
                  <div 
                    key={item.id} 
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <a 
                      href={item.url} 
                      className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2 tracking-wide opacity-90 hover:opacity-100 hover:bg-current hover:bg-opacity-5"
                    >
                      {ItemIcon && <ItemIcon className="w-4 h-4 opacity-70" />}
                      {item.label}
                      {item.children.length > 0 && (
                        <motion.div
                          animate={{ rotate: hoveredItem === item.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </motion.div>
                      )}
                    </a>
                    
                    {/* Dropdown with AnimatePresence */}
                    <AnimatePresence>
                      {item.children.length > 0 && hoveredItem === item.id && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`absolute top-full left-0 mt-2 w-56 rounded-2xl py-3 origin-top-left overflow-hidden ${currentTheme.dropdown}`}
                        >
                          {item.children.map((child) => {
                             const ChildIcon = child.icon && iconMap[child.icon] ? iconMap[child.icon] : null;
                             return (
                              <motion.a 
                                key={child.id}
                                href={child.url}
                                variants={itemVariants}
                                className="flex items-center justify-between px-6 py-2.5 text-sm hover:opacity-60 transition-opacity group/link"
                              >
                                <span className="flex items-center gap-3">
                                   {ChildIcon && <ChildIcon className="w-4 h-4 opacity-50" />}
                                   {child.label}
                                </span>
                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-transform duration-200" />
                              </motion.a>
                             );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               );
            })}
            
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
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              variants={mobileContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`md:hidden absolute top-20 left-0 right-0 overflow-y-auto ${currentTheme.mobileMenu}`}
            >
              <div className="flex flex-col space-y-4 p-8">
                {menu.items.map((item) => {
                  const ItemIcon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
                  return (
                    <motion.div 
                      key={item.id}
                      variants={mobileItemVariants}
                    >
                      <a 
                        href={item.url}
                        className={`
                          block py-3 text-2xl font-serif font-medium border-b border-current border-opacity-10 flex items-center gap-3
                          ${item.depth > 0 ? 'ml-6 text-lg opacity-70 border-none py-2 font-sans' : ''} 
                        `}
                      >
                        {ItemIcon && <ItemIcon className={item.depth > 0 ? "w-5 h-5" : "w-6 h-6"} />}
                        {item.label}
                      </a>
                    </motion.div>
                  );
                })}
                
                <motion.div 
                  variants={mobileItemVariants}
                  className="pt-8 mt-4"
                >
                   <button className="w-full py-4 bg-current text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest shadow-lg">
                     Get Started
                   </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};