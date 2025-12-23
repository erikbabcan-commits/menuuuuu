import React, { useState, useMemo, useEffect } from 'react';
import { Menu, MenuItem, MealTime, Language } from '../types';
import { 
  Sparkles, Leaf, Globe, UtensilsCrossed 
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { themeStyles, accentColors } from '../utils/themeStyles';

interface MenuPreviewProps {
  menu: Menu;
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu }) => {
  const [currentLang, setCurrentLang] = useState<Language>('sk');
  const [currentTimeFilter, setCurrentTimeFilter] = useState<MealTime>('all');
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) setCurrentTimeFilter('breakfast');
    else if (hour >= 11 && hour < 16) setCurrentTimeFilter('lunch');
    else if (hour >= 16 || hour < 6) setCurrentTimeFilter('dinner');
  }, []);

  // Hierarchické zoskupenie: Jedlá patria pod poslednú definovanú sekciu
  const groupedMenu = useMemo(() => {
    const groups: { section: MenuItem | null, items: MenuItem[] }[] = [];
    let currentGroup: { section: MenuItem | null, items: MenuItem[] } = { section: null, items: [] };

    menu.items.forEach(item => {
      if (currentTimeFilter !== 'all' && item.schedule && item.schedule !== 'all' && item.schedule !== currentTimeFilter) {
        return;
      }

      if (item.type === 'section') {
        if (currentGroup.items.length > 0 || currentGroup.section) {
          groups.push(currentGroup);
        }
        currentGroup = { section: item, items: [] };
      } else {
        currentGroup.items.push(item);
      }
    });
    
    if (currentGroup.items.length > 0 || currentGroup.section) {
      groups.push(currentGroup);
    }

    return groups;
  }, [menu.items, currentTimeFilter]);

  const currentTheme = themeStyles[menu.theme] || themeStyles.glass;
  const currentAccent = accentColors[menu.accentColor] || accentColors.slate;
  const fontClass = menu.fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <div className={`w-full h-full relative overflow-x-hidden flex flex-col items-center ${currentTheme.background} ${fontClass} selection:${currentAccent.bg} selection:text-white`}>
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="w-full h-full relative overflow-y-auto scroll-smooth flex flex-col scrollbar-hide">
        
        <div className="relative h-[60dvh] lg:h-[80dvh] shrink-0 overflow-hidden bg-slate-950">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
            {menu.heroImageUrl ? (
              <img src={menu.heroImageUrl} className="w-full h-full object-cover scale-110 brightness-[0.7]" alt="Hero" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${currentAccent.bg} opacity-40`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </motion.div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl lg:text-8xl font-serif font-bold text-white tracking-tighter drop-shadow-2xl">
                {menu.name}
              </h1>
              <div className="flex gap-4 justify-center">
                 {menu.activeLanguages.map(lang => (
                   <button key={lang} onClick={() => setCurrentLang(lang)} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${currentLang === lang ? 'bg-white text-slate-900 border-white' : 'text-white/40 border-white/10 hover:border-white/30'}`}>{lang}</button>
                 ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="bg-white min-h-screen relative z-10 px-6 py-12 lg:py-24">
          <div className="max-w-4xl mx-auto space-y-24">
            <AnimatePresence mode="popLayout">
              {groupedMenu.map((group, idx) => (
                <motion.section 
                  key={group.section?.id || `group-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {group.section && (
                    <div className="text-center space-y-4">
                      <div className={`h-px w-12 mx-auto ${currentAccent.bg} opacity-30`} />
                      <h2 className="text-3xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight uppercase italic">
                        {group.section.translations?.[currentLang]?.label || group.section.label}
                      </h2>
                      {group.section.description && <p className="text-slate-400 text-sm italic">{group.section.description}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-12 lg:gap-16">
                    {group.items.map((item) => (
                      <motion.div 
                        key={item.id} 
                        layout
                        className="group flex flex-col md:flex-row gap-6 lg:gap-10 items-start md:items-center"
                      >
                        {item.image && (
                          <div className="w-full md:w-44 h-44 shrink-0 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.label} />
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-baseline gap-4 border-b border-slate-50 pb-2">
                            <h3 className="text-xl lg:text-2xl font-serif font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {item.translations?.[currentLang]?.label || item.label}
                            </h3>
                            <span className={`text-xl lg:text-2xl font-serif italic ${currentAccent.text} shrink-0`}>{item.price}</span>
                          </div>
                          <p className="text-slate-500 text-sm font-light italic leading-relaxed">
                            {item.translations?.[currentLang]?.description || item.description}
                          </p>
                          <div className="flex items-center gap-3">
                            {item.isChefChoice && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Chef</span>}
                            {item.dietaryTags?.map(tag => <span key={tag} className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1"><Leaf className="w-2.5 h-2.5" /> {tag}</span>)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <footer className="bg-slate-50 p-12 lg:p-20 text-center border-t border-slate-100">
           <div className="max-w-4xl mx-auto space-y-6">
              <h4 className="font-serif text-2xl lg:text-4xl font-bold tracking-tighter">{menu.name}</h4>
              <div className="pt-8 text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Tvorba: Luxury CMS Platinum</div>
           </div>
        </footer>
      </div>
    </div>
  );
};