import React, { useState, useMemo, useEffect } from 'react';
import { Menu, MenuItem, MealTime, Language } from '../types';
import { 
  MapPin, Phone, Instagram, Sparkles, Leaf, Info, Clock, 
  ChevronRight, Globe, Check, Star, Zap 
} from 'lucide-react';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import { themeStyles, accentColors } from '../utils/themeStyles';

interface MenuPreviewProps {
  menu: Menu;
}

const LANGUAGES: Record<Language, string> = {
  sk: 'Slovenčina',
  en: 'English',
  de: 'Deutsch'
};

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu }) => {
  const [currentLang, setCurrentLang] = useState<Language>('sk');
  const [currentTimeFilter, setCurrentTimeFilter] = useState<MealTime>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Autodetekcia času dňa pre Smart Scheduling
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) setCurrentTimeFilter('breakfast');
    else if (hour >= 11 && hour < 16) setCurrentTimeFilter('lunch');
    else if (hour >= 16 || hour < 6) setCurrentTimeFilter('dinner');
  }, []);

  const structure = useMemo(() => {
    const roots: (MenuItem & { children: MenuItem[] })[] = [];
    let currentRoot: (MenuItem & { children: MenuItem[] }) | null = null;

    const filteredItems = menu.items.filter(item => {
      if (currentTimeFilter === 'all') return true;
      if (!item.schedule || item.schedule === 'all') return true;
      return item.schedule === currentTimeFilter;
    });

    filteredItems.forEach(item => {
      if (item.depth === 0) {
        currentRoot = { ...item, children: [] };
        roots.push(currentRoot);
      } else if (currentRoot && item.depth === 1) {
        currentRoot.children.push(item);
      }
    });

    if (roots.length > 0 && !activeCategory) {
      setActiveCategory(roots[0].id);
    }

    return roots;
  }, [menu.items, currentTimeFilter]);

  const currentTheme = themeStyles[menu.theme] || themeStyles.glass;
  const currentAccent = accentColors[menu.accentColor] || accentColors.slate;
  const fontClass = menu.fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <div className={`w-full h-full relative overflow-x-hidden flex flex-col items-center ${currentTheme.background} ${fontClass} selection:${currentAccent.bg} selection:text-white`}>
      
      {/* High-end "Grain" texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="w-full h-full relative overflow-y-auto scroll-smooth flex flex-col scrollbar-hide">
        
        {/* Parallax Hero */}
        <div className="relative h-[80dvh] shrink-0 overflow-hidden bg-slate-950">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
            {menu.heroImageUrl ? (
              <img src={menu.heroImageUrl} className="w-full h-full object-cover scale-110 brightness-[0.7]" alt="Hero" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${currentAccent.bg} opacity-40`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </motion.div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-2">
                 <div className="h-px w-8 bg-white/30" />
                 <span className="text-[10px] font-bold text-white/60 tracking-[0.4em] uppercase">Est. 2025</span>
                 <div className="h-px w-8 bg-white/30" />
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tighter drop-shadow-2xl">
                {menu.name}
              </h1>
              <div className="flex gap-4 justify-center">
                 {menu.activeLanguages.map(lang => (
                   <button 
                    key={lang} 
                    onClick={() => setCurrentLang(lang)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${currentLang === lang ? 'bg-white text-slate-900 border-white' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                   >
                     {lang}
                   </button>
                 ))}
              </div>
            </motion.div>
          </div>

          {/* Smart Scheduling Tabs */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6">
             <div className="bg-black/20 backdrop-blur-3xl border border-white/10 p-1 rounded-full flex gap-1">
                {(['breakfast', 'lunch', 'dinner', 'all'] as MealTime[]).map(time => (
                  <button 
                    key={time}
                    onClick={() => setCurrentTimeFilter(time)}
                    className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${currentTimeFilter === time ? `${currentAccent.bg} text-white shadow-xl` : 'text-white/40 hover:text-white'}`}
                  >
                    {time === 'all' ? 'Menu' : time}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white min-h-screen relative z-10 px-6 py-20">
          <div className="max-w-5xl mx-auto">
            
            {/* Category Navigation */}
            <div className="flex items-center justify-center gap-8 mb-24 overflow-x-auto pb-4 scrollbar-hide">
               {structure.map(cat => (
                 <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs font-bold uppercase tracking-[0.3em] transition-all relative pb-2 whitespace-nowrap ${activeCategory === cat.id ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
                 >
                   {cat.label}
                   {activeCategory === cat.id && (
                     <motion.div layoutId="cat-underline" className={`absolute bottom-0 left-0 right-0 h-0.5 ${currentAccent.bg}`} />
                   )}
                 </button>
               ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCategory + currentTimeFilter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-20"
              >
                {structure.find(c => c.id === activeCategory)?.children.map((item) => (
                  <div key={item.id} className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 border-b border-slate-50 pb-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.translations?.[currentLang]?.label || item.label}
                        </h3>
                        {item.isChefChoice && (
                          <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Chef's Choice
                          </span>
                        )}
                        {item.isLimitedEdition && (
                          <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-rose-100">
                            Limitovaná edícia
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm font-light leading-relaxed italic max-w-2xl">
                        {item.translations?.[currentLang]?.description || item.description}
                      </p>
                      <div className="flex gap-4">
                         {item.dietaryTags?.map(tag => (
                           <div key={tag} className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                             <Leaf className="w-3 h-3" /> {tag}
                           </div>
                         ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-start">
                       <span className={`text-3xl font-serif italic ${currentAccent.text}`}>{item.price}</span>
                       {item.allergens && item.allergens.length > 0 && (
                         <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-2">Alergény: {item.allergens.join(', ')}</span>
                       )}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-50 p-20 text-center border-t border-slate-100">
           <div className="max-w-4xl mx-auto space-y-12">
              <h4 className="font-serif text-3xl font-bold tracking-tighter">{menu.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Rezervácie</span>
                    <p className="text-sm text-slate-600">+421 900 000 000</p>
                 </div>
                 <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Poloha</span>
                    <p className="text-sm text-slate-600">Staré Mesto, Bratislava</p>
                 </div>
                 <div className="space-y-4 text-slate-400 flex justify-center gap-4 pt-4">
                    <Instagram className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                    <Globe className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                 </div>
              </div>
              <div className="pt-12 text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Luxury Menu Builder Platinum 2025</div>
           </div>
        </footer>
      </div>
    </div>
  );
};