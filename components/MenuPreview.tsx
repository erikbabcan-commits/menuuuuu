
import React, { useState, useMemo } from 'react';
import { Menu, MenuItem, Language } from '../types';
import { 
  Leaf, Wine, Filter, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeStyles, accentColors } from '../utils/themeStyles';
import { iconMap } from '../utils/icons';

interface MenuPreviewProps {
  menu: Menu;
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu }) => {
  const [currentLang, setCurrentLang] = useState<Language>('sk');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const dietaryTags = useMemo(() => {
    const tags = new Set<string>();
    menu.items.forEach(item => item.dietaryTags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [menu.items]);

  const filteredItems = useMemo(() => {
    if (!activeFilter) return menu.items;
    return menu.items.filter(item => 
      item.type === 'section' || item.dietaryTags?.includes(activeFilter)
    );
  }, [menu.items, activeFilter]);

  const groupedMenu = useMemo(() => {
    const groups: { section: MenuItem | null, items: MenuItem[] }[] = [];
    let currentGroup: { section: MenuItem | null, items: MenuItem[] } = { section: null, items: [] };

    filteredItems.forEach(item => {
      if (item.type === 'section') {
        if (currentGroup.items.length > 0 || currentGroup.section) groups.push(currentGroup);
        currentGroup = { section: item, items: [] };
      } else {
        currentGroup.items.push(item);
      }
    });
    if (currentGroup.items.length > 0 || currentGroup.section) groups.push(currentGroup);
    return groups;
  }, [filteredItems]);

  const currentTheme = themeStyles[menu.theme] || themeStyles.glass;
  const currentAccent = accentColors[menu.accentColor] || accentColors.slate;
  
  const getFontFamily = () => {
    switch(menu.fontFamily) {
      case 'playfair': return 'font-["Playfair_Display"]';
      case 'montserrat': return 'font-["Montserrat"]';
      case 'cormorant': return 'font-["Cormorant_Garamond"]';
      case 'oswald': return 'font-["Oswald"]';
      case 'serif': return 'font-serif';
      default: return 'font-sans';
    }
  };

  const baseFontSize = menu.baseFontSize || 16;

  return (
    <div className={`w-full h-full relative overflow-x-hidden flex flex-col ${currentTheme.background} ${getFontFamily()} scrollbar-hide`} style={{ fontSize: `${baseFontSize}px` }}>
      {/* Dynamic Header */}
      <div className="relative h-64 shrink-0 overflow-hidden">
        <div className="absolute inset-0">
          {menu.heroImageUrl ? (
            <img src={menu.heroImageUrl} className="w-full h-full object-cover" alt="Hero" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${currentAccent.bg}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>
        
        <div className="absolute bottom-8 left-6 right-6">
           <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg leading-tight">{menu.name}</h1>
           <div className="flex gap-2 mt-4">
              {menu.activeLanguages.map(l => (
                <button key={l} onClick={() => setCurrentLang(l)} className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border transition-all ${currentLang === l ? 'bg-white text-black border-white' : 'text-white/50 border-white/20 hover:border-white/40'}`}>{l}</button>
              ))}
           </div>
        </div>

        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-xl"
        >
          {activeFilter ? <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute top-0 right-0 border-2 border-slate-900" /> : null}
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="bg-slate-950 overflow-hidden"
          >
            <div className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Filtrovať preferencie</span>
                  {activeFilter && <button onClick={() => setActiveFilter(null)} className="text-[9px] text-rose-400 font-bold uppercase tracking-widest bg-rose-400/10 px-2 py-1 rounded">Reset</button>}
               </div>
               <div className="flex flex-wrap gap-2">
                  {dietaryTags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setActiveFilter(tag === activeFilter ? null : tag)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter === tag ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                      {tag}
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-6 py-12 space-y-20 scrollbar-hide">
         <AnimatePresence mode="popLayout">
           {groupedMenu.map((group, idx) => (
             <motion.section key={group.section?.id || idx} layout className="space-y-12">
                {group.section && (
                  <div className="text-center relative">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 -z-10" />
                    <div className="bg-white inline-flex items-center gap-4 px-8 py-2 relative">
                        {group.section.icon && iconMap[group.section.icon] && React.createElement(iconMap[group.section.icon], { className: `w-5 h-5 ${currentAccent.text}` })}
                        <h2 className="text-2xl font-bold text-slate-900 tracking-[0.2em] uppercase italic">
                        {group.section.translations?.[currentLang]?.label || group.section.label}
                        </h2>
                    </div>
                  </div>
                )}
                
                <div className="space-y-16">
                   {group.items.map(item => {
                     const ItemIcon = item.icon ? iconMap[item.icon] : null;
                     return (
                     <motion.div key={item.id} layout className="group space-y-5">
                        <div className="flex gap-5 items-start">
                           {item.image && (
                             <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shrink-0 shadow-xl border border-slate-100">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.label} />
                             </div>
                           )}
                           <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-baseline gap-4 border-b border-slate-50 pb-2">
                                 <div className="flex items-center gap-3">
                                    {ItemIcon && <ItemIcon className={`w-4 h-4 ${currentAccent.text} opacity-50`} />}
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                    {item.translations?.[currentLang]?.label || item.label}
                                    </h3>
                                 </div>
                                 <span className={`text-xl italic font-serif ${currentAccent.text} shrink-0`}>{item.price}</span>
                              </div>
                              <p className="text-sm text-slate-500 italic leading-relaxed font-light opacity-80">
                                {item.translations?.[currentLang]?.description || item.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2.5 mt-3">
                                 {item.dietaryTags?.map(tag => (
                                   <span key={tag} className="text-[7px] font-bold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100"><Leaf className="w-2.5 h-2.5" /> {tag}</span>
                                 ))}
                                 {item.isChefChoice && <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-100"><Utensils className="w-2.5 h-2.5" /> Chef's Tip</span>}
                                 {item.allergens && item.allergens.length > 0 && (
                                   <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-slate-400 border border-slate-200 px-2.5 py-1 rounded-full">Alergény: {item.allergens.join(', ')}</span>
                                 )}
                              </div>
                           </div>
                        </div>

                        {item.pairing && (
                          <div className="ml-4 md:ml-32 p-4 bg-indigo-50/40 rounded-[2rem] border border-indigo-100/50 flex items-center gap-4 group/wine">
                             <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-indigo-100 group-hover/wine:scale-110 transition-transform"><Wine className="w-4 h-4" /></div>
                             <div className="space-y-0.5">
                                <span className="block text-[8px] font-bold uppercase tracking-[0.3em] text-indigo-400 leading-none mb-1">Sommelier recommends</span>
                                <p className="text-[11px] italic text-indigo-950 font-medium leading-tight">{item.translations?.[currentLang]?.pairing || item.pairing}</p>
                             </div>
                          </div>
                        )}
                     </motion.div>
                   )})}
                </div>
             </motion.section>
           ))}
         </AnimatePresence>
      </div>

      <footer className="p-12 text-center border-t border-slate-50">
         <div className="flex items-center justify-center gap-4 mb-6 opacity-20">
            <div className="h-px w-8 bg-slate-900" />
            <Utensils className="w-4 h-4" />
            <div className="h-px w-8 bg-slate-900" />
         </div>
         <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-slate-300">{menu.name} • DIGITAL ATELIER</p>
      </footer>
    </div>
  );
};
