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
        ease: [0.23, 1, 0.32, 1],
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
    hidden: { 
      opacity: 0,
      y: -20,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.45, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  };

  const mobileItemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      filter: "blur(8px)" 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    }
  };

  return (
    <div className={`w-full h-full relative overflow-y-auto overflow-x-hidden font-sans select-none ${currentTheme.background || 'bg-slate-100'}`}>
      {/* Background with Mesh Gradient for Premium Feel */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 via-transparent to-emerald-50/50 mix-blend-overlay" />
      </div>
      
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`space-y-6 max-w-3xl ${currentTheme.heroText}`}
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-current/20 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-4 opacity-70">
            Kolekcia 2025
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] tracking-tight">
            Nová definícia <br/>
            <span className="italic font-light opacity-90">Digitálneho Luxusu.</span>
          </h1>
          <p className="text-base md:text-lg opacity-70 font-light leading-relaxed max-w-lg mx-auto">
            Zažite harmóniu formy a funkcie. Tento náhľad demonštruje integráciu vášho menu s prémiovým estetickým rozložením.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button className={`h-12 px-8 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 ${menu.theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
              Zobraziť ponuku
            </button>
            <button className={`h-12 px-8 rounded-full border border-current/20 font-medium hover:bg-current/5 transition-colors`}>
              Vytvoriť rezerváciu
            </button>
          </div>
        </motion.div>
      </div>

      {/* The Navigation Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${currentTheme.nav}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="font-serif font-bold text-2xl tracking-tighter flex items-center gap-2 cursor-pointer z-50 relative">
            <div className="w-8 h-8 bg-current opacity-20 rounded-full" />
            {menu.name || 'Luxe.'}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
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
                      className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 tracking-wide opacity-80 hover:opacity-100 hover:bg-current/5"
                    >
                      {ItemIcon && <ItemIcon className="w-3.5 h-3.5 opacity-70" />}
                      {item.label}
                      {item.children.length > 0 && (
                        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-300 ${hoveredItem === item.id ? 'rotate-180' : ''}`} />
                      )}
                    </a>
                    
                    {/* Desktop Dropdown */}
                    <AnimatePresence>
                      {item.children.length > 0 && hoveredItem === item.id && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`absolute top-full left-0 mt-2 w-64 rounded-2xl p-2 origin-top-left overflow-hidden ${currentTheme.dropdown}`}
                        >
                          {item.children.map((child) => {
                             const ChildIcon = child.icon && iconMap[child.icon] ? iconMap[child.icon] : null;
                             return (
                              <motion.a 
                                key={child.id}
                                href={child.url}
                                variants={itemVariants}
                                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm hover:bg-current/5 transition-colors group/link"
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
            
            <div className="ml-6 pl-6 border-l border-current/10">
               <button className="px-6 py-2.5 bg-current text-white dark:text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-current/20">
                 Rezervovať
               </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 rounded-full hover:bg-current/10 transition-colors z-50 relative"
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
              className={`fixed inset-0 z-40 pt-24 pb-8 px-6 flex flex-col overflow-y-auto ${currentTheme.mobileMenu}`}
            >
              <div className="flex flex-col space-y-6">
                {structure.map((item) => {
                  const ItemIcon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
                  return (
                    <motion.div key={item.id} variants={mobileItemVariants}>
                      <a 
                        href={item.url}
                        className="flex items-center gap-4 text-3xl font-serif font-medium opacity-90"
                      >
                        {ItemIcon && <ItemIcon className="w-6 h-6 opacity-50" />}
                        {item.label}
                      </a>
                      
                      {/* Mobile Submenu */}
                      {item.children.length > 0 && (
                        <div className="mt-4 ml-2 pl-6 border-l border-current/10 space-y-3">
                          {item.children.map(child => (
                             <a 
                               key={child.id}
                               href={child.url} 
                               className="block text-lg opacity-60 font-medium py-1"
                             >
                               {child.label}
                             </a>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                
                <motion.div variants={mobileItemVariants} className="pt-8 mt-auto">
                   <button className="w-full py-4 bg-current text-white dark:text-slate-900 rounded-2xl font-bold uppercase tracking-widest shadow-xl">
                     Rezervovať stôl
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