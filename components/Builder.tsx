import React, { useState, useCallback, useMemo } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, GripVertical, Plus, Trash2, 
  Sparkles, Save, Palette, Layers, Eye, Smile, Edit2, Zap,
  Settings, Link as LinkIcon, Type as TypeIcon, X, LayoutTemplate, Image as ImageIcon, DollarSign,
  Monitor, Smartphone, Clock, Leaf, Info, Star, Globe
} from 'lucide-react';
import { Menu, MenuItem, MenuTheme, AiGeneratedItem, PlanTier, AccentColor, FontFamily, MealTime, Language } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateMenuStructure, generateDishDescription } from '../services/geminiService';
import { IconPicker } from './IconPicker';
import { iconMap } from '../utils/icons';
import { accentColors } from '../utils/themeStyles';

interface BuilderProps {
  menuId: string | null;
  onBack: () => void;
  onSave: (menu: Menu) => void;
  initialData?: Menu;
  currentPlan: PlanTier;
  onUpgrade: () => void;
}

const DIETARY_TAG_OPTIONS: ('vegan' | 'vegetarian' | 'paleo' | 'keto' | 'gluten-free')[] = ['vegan', 'vegetarian', 'paleo', 'keto', 'gluten-free'];
const AVAILABLE_LANGS: Language[] = ['sk', 'en', 'de'];

export const Builder: React.FC<BuilderProps> = ({ 
  menuId, onBack, onSave, initialData 
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [editingLang, setEditingLang] = useState<Language>('sk');
  
  const [menuData, setMenuData] = useState<Omit<Menu, 'id' | 'createdAt'>>({
    name: initialData?.name || 'Nové Menu',
    items: initialData?.items || [],
    theme: initialData?.theme || 'glass',
    accentColor: initialData?.accentColor || 'indigo',
    fontFamily: initialData?.fontFamily || 'serif',
    borderRadius: initialData?.borderRadius || 'md',
    heroImageUrl: initialData?.heroImageUrl || '',
    activeLanguages: initialData?.activeLanguages || ['sk']
  });

  const [uiState, setUiState] = useState({
    prompt: '',
    isGenerating: false,
    isGeneratingDesc: false,
    iconPickerOpen: null as string | null,
    editingItemId: null as string | null,
    previewDevice: 'desktop' as 'desktop' | 'mobile'
  });

  const updateMenuData = useCallback((updates: Partial<typeof menuData>) => {
    setMenuData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  }, []);

  const updateItemTranslation = (id: string, lang: Language, field: 'label' | 'description', value: string) => {
    setMenuData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        const translations = { ...(item.translations || {}) };
        translations[lang] = { ...(translations[lang] || { label: '', description: '' }), [field]: value };
        const rootUpdates = lang === 'sk' ? { [field]: value } : {};
        return { ...item, translations, ...rootUpdates };
      })
    }));
  };

  const handleGenerate = useCallback(async () => {
    if (!uiState.prompt.trim()) return;
    updateUiState({ isGenerating: true });
    try {
      const data = await generateMenuStructure(uiState.prompt);
      const newItems: MenuItem[] = [];
      const processNode = (node: AiGeneratedItem, depth: number) => {
        newItems.push({ 
          id: crypto.randomUUID(), 
          label: node.label, 
          description: node.description,
          price: node.price,
          url: node.url || '#', 
          depth,
          schedule: 'all',
          translations: { sk: { label: node.label, description: node.description } }
        });
        if (node.children) node.children.forEach(child => processNode(child, depth + 1));
      };
      data.forEach(root => processNode(root, 0));
      updateMenuData({ items: newItems });
      setActiveTab('preview');
    } finally {
      updateUiState({ isGenerating: false });
    }
  }, [uiState.prompt, updateMenuData, updateUiState]);

  const handleSaveClick = useCallback(() => {
    onSave({ 
      ...menuData, 
      id: menuId || crypto.randomUUID(), 
      createdAt: initialData?.createdAt || Date.now() 
    } as Menu);
  }, [menuData, menuId, initialData, onSave]);

  const addItem = useCallback(() => {
    const id = crypto.randomUUID();
    const newItem: MenuItem = { id, label: 'Nová položka', url: '#', depth: 0, schedule: 'all', translations: { sk: { label: 'Nová položka' } } };
    setMenuData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setUiState(prev => ({ ...prev, editingItemId: id }));
  }, []);

  const editingItem = useMemo(() => 
    menuData.items.find(i => i.id === uiState.editingItemId),
  [menuData.items, uiState.editingItemId]);

  const currentAccent = accentColors[menuData.accentColor] || accentColors.slate;

  return (
    <div className="h-dvh w-full flex flex-col bg-[#f1f5f9] overflow-hidden pt-safe">
      <header className="h-20 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-40 shadow-sm relative">
        <div className="flex items-center gap-4 w-1/3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="hidden lg:flex flex-col truncate">
            <h2 className="font-serif font-bold text-slate-900 truncate">{menuData.name}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none">Všetky zmeny uložené</span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner-3d">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Editor
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Náhľad
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3">
           <Button variant="primary" size="sm" onClick={handleSaveClick} className="rounded-xl h-11 shadow-xl bg-slate-900 border border-slate-700">
             Uložiť Projekt
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div 
          animate={{ x: activeTab === 'editor' ? 0 : '-100%', opacity: activeTab === 'editor' ? 1 : 0 }}
          className="w-full lg:w-[450px] bg-white border-r border-slate-200 overflow-y-auto p-8 space-y-12 pb-32 scrollbar-hide shadow-lg"
        >
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Globálny Design</h3>
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Jazykové mutácie</label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner-3d">
                     {AVAILABLE_LANGS.map(lang => (
                       <button 
                        key={lang} 
                        onClick={() => {
                          const nextLangs = menuData.activeLanguages.includes(lang)
                            ? menuData.activeLanguages.filter(l => l !== lang)
                            : [...menuData.activeLanguages, lang];
                          if (nextLangs.length > 0) updateMenuData({ activeLanguages: nextLangs });
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${menuData.activeLanguages.includes(lang) ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                       >
                         {lang}
                       </button>
                     ))}
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Farebný akcent</label>
                  <div className="flex gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner-3d">
                     {(Object.keys(accentColors) as AccentColor[]).map(c => (
                       <button 
                        key={c} 
                        onClick={() => updateMenuData({ accentColor: c })}
                        className={`flex-1 h-9 rounded-xl transition-all ${accentColors[c].bg} ${menuData.accentColor === c ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 shadow-lg' : 'opacity-30 hover:opacity-100 border border-black/10'}`} 
                       />
                     ))}
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Štruktúra Menu</h3>
                <Button size="sm" variant="ghost" onClick={addItem} className="text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100"><Plus className="w-4 h-4 mr-2" /> Pridať</Button>
             </div>
             
             <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-5 shadow-brutal relative overflow-hidden group border border-slate-800">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-500/30 transition-all" />
               <div className="relative z-10 space-y-5">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Generátor</div>
                 <h4 className="text-base font-serif font-bold">Vytvoriť nový koncept</h4>
                 <textarea 
                  value={uiState.prompt}
                  onChange={e => updateUiState({ prompt: e.target.value })}
                  placeholder="napr. Moderné Ázijské bistro..."
                  className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-xs text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none shadow-inner transition-all placeholder:text-white/20"
                 />
                 <Button variant="gradient" size="md" className="w-full h-12 rounded-2xl shadow-lg border border-white/10" onClick={handleGenerate} isLoading={uiState.isGenerating}>Vytvoriť Menu</Button>
               </div>
             </div>

             <div className="space-y-4 pt-4">
                {menuData.items.map(item => (
                  <div key={item.id} className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 p-5 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md cursor-default">
                     <GripVertical className="w-4.5 h-4.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.label}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em]">{item.price || 'Bez ceny'}</p>
                     </div>
                     <button onClick={() => updateUiState({ editingItemId: item.id })} className="p-2.5 bg-white text-slate-500 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                  </div>
                ))}
             </div>
          </section>
        </motion.div>

        {/* Live Preview Area */}
        <div className="flex-1 bg-slate-100/50 p-6 md:p-12 overflow-hidden flex flex-col items-center gap-10 relative">
           <div className="bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-brutal border border-slate-200 flex gap-8 items-center z-20">
              <div className="flex p-1 bg-slate-200/50 rounded-xl border border-slate-200/50 shadow-inner-3d">
                 <button onClick={() => updateUiState({ previewDevice: 'desktop' })} className={`p-2.5 rounded-lg transition-all ${uiState.previewDevice === 'desktop' ? 'bg-white shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}><Monitor className="w-4.5 h-4.5" /></button>
                 <button onClick={() => updateUiState({ previewDevice: 'mobile' })} className={`p-2.5 rounded-lg transition-all ${uiState.previewDevice === 'mobile' ? 'bg-white shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone className="w-4.5 h-4.5" /></button>
              </div>
              <div className="flex gap-2.5">
                 {['glass', 'dark', 'light'].map(t => (
                   <button 
                    key={t} 
                    onClick={() => updateMenuData({ theme: t as MenuTheme })}
                    className={`text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all border ${menuData.theme === t ? 'bg-slate-900 text-white border-slate-800 shadow-lg' : 'bg-white/50 text-slate-400 border-slate-200 hover:bg-white hover:text-slate-700'}`}
                   >
                     {t}
                   </button>
                 ))}
              </div>
           </div>

           <div className={`transition-all duration-700 bg-white shadow-[0_60px_120px_rgba(0,0,0,0.2)] relative overflow-hidden border border-slate-300 ${uiState.previewDevice === 'mobile' ? 'w-[375px] h-[750px] rounded-[3.5rem] border-[12px] border-slate-950 shadow-[0_40px_80px_rgba(0,0,0,0.3)]' : 'w-full h-full rounded-[3rem]'}`}>
              <MenuPreview menu={{ ...menuData, id: 'preview', createdAt: 0 } as Menu} />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {uiState.editingItemId && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => updateUiState({ editingItemId: null })} className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" />
             <motion.div layoutId="item-modal" className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90dvh] border border-slate-200">
                <div className="p-10 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${currentAccent.bg} text-white flex items-center justify-center shadow-xl border border-black/10`}><Settings className="w-7 h-7" /></div>
                      <div>
                         <h2 className="text-3xl font-serif font-bold text-slate-900">Editor položky</h2>
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Detailná správa kulinárskeho záznamu</p>
                      </div>
                   </div>
                   <button onClick={() => updateUiState({ editingItemId: null })} className="p-4 hover:bg-slate-100 rounded-full transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900"><X className="w-7 h-7" /></button>
                </div>

                <div className="p-10 overflow-y-auto space-y-12 scrollbar-hide">
                   <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner-3d">
                      {menuData.activeLanguages.map(lang => (
                        <button 
                          key={lang}
                          onClick={() => setEditingLang(lang)}
                          className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${editingLang === lang ? 'bg-white text-slate-900 shadow-md border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {lang}
                        </button>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Názov položky ({editingLang.toUpperCase()})</label>
                            <input 
                              value={editingItem.translations?.[editingLang]?.label || (editingLang === 'sk' ? editingItem.label : '')} 
                              onChange={(e) => updateItemTranslation(editingItem.id, editingLang, 'label', e.target.value)} 
                              className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-inner-3d focus:border-indigo-300" 
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Cena (formát napr. 24€)</label>
                            <input value={editingItem.price || ''} onChange={(e) => updateItem(editingItem.id, { price: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 text-sm font-serif italic focus:bg-white shadow-inner-3d transition-all outline-none focus:border-indigo-300" placeholder="€0.00" />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Plánované zobrazenie</label>
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-3xl border border-slate-200">
                               {(['breakfast', 'lunch', 'dinner', 'all'] as MealTime[]).map(time => (
                                 <button key={time} onClick={() => updateItem(editingItem.id, { schedule: time })} className={`px-4 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${editingItem.schedule === time ? 'bg-slate-900 text-white border-slate-800 shadow-lg' : 'bg-white/60 text-slate-500 border-slate-200 hover:bg-white hover:text-slate-700 shadow-sm'}`}>
                                   {time}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Prémiové príznaky</label>
                            <div className="grid grid-cols-1 gap-4">
                               <button 
                                onClick={() => updateItem(editingItem.id, { isChefChoice: !editingItem.isChefChoice })}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${editingItem.isChefChoice ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                               >
                                 <div className="flex items-center gap-3">
                                   <div className={`p-2 rounded-xl ${editingItem.isChefChoice ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-400'}`}><Star className="w-4.5 h-4.5" /></div>
                                   <span className="text-xs font-bold uppercase tracking-widest">Chef's Choice</span>
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${editingItem.isChefChoice ? 'bg-amber-500 border-amber-600' : 'border-slate-300'}`}>
                                   {editingItem.isChefChoice && <div className="w-2 h-2 bg-white rounded-full" />}
                                 </div>
                               </button>
                               <button 
                                onClick={() => updateItem(editingItem.id, { isLimitedEdition: !editingItem.isLimitedEdition })}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${editingItem.isLimitedEdition ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                               >
                                 <div className="flex items-center gap-3">
                                   <div className={`p-2 rounded-xl ${editingItem.isLimitedEdition ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-400'}`}><Zap className="w-4.5 h-4.5" /></div>
                                   <span className="text-xs font-bold uppercase tracking-widest">Limitovaná edícia</span>
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${editingItem.isLimitedEdition ? 'bg-rose-500 border-rose-600' : 'border-slate-300'}`}>
                                   {editingItem.isLimitedEdition && <div className="w-2 h-2 bg-white rounded-full" />}
                                 </div>
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between px-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kulinársky popis ({editingLang.toUpperCase()})</label>
                         <button 
                          onClick={async () => {
                            updateUiState({ isGeneratingDesc: true });
                            const desc = await generateDishDescription(editingItem.translations?.[editingLang]?.label || editingItem.label);
                            updateItemTranslation(editingItem.id, editingLang, 'description', desc);
                            updateUiState({ isGeneratingDesc: false });
                          }}
                          className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all shadow-sm"
                         >
                           <Sparkles className={`w-3.5 h-3.5 ${uiState.isGeneratingDesc ? 'animate-spin' : ''}`} /> {uiState.isGeneratingDesc ? 'Skladám text...' : 'AI Generátor Popisu'}
                         </button>
                      </div>
                      <textarea 
                        value={editingItem.translations?.[editingLang]?.description || (editingLang === 'sk' ? editingItem.description : '')} 
                        onChange={(e) => updateItemTranslation(editingItem.id, editingLang, 'description', e.target.value)} 
                        className="w-full h-36 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-sm italic font-light outline-none focus:bg-white focus:border-indigo-300 shadow-inner-3d transition-all resize-none scrollbar-hide" 
                        placeholder="Zadajte poetický popis vášho pokrmu..." 
                      />
                   </div>
                </div>

                <div className="p-10 bg-slate-900 border-t border-slate-800 flex gap-4 shrink-0">
                   <Button variant="primary" className="flex-1 h-16 rounded-2xl text-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-2xl" onClick={() => updateUiState({ editingItemId: null })}>Uložiť zmeny položky</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};