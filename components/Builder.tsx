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
    <div className="h-dvh w-full flex flex-col bg-[#edf2f7] overflow-hidden pt-safe">
      <header className="h-24 px-6 md:px-10 bg-white border-b border-slate-300 flex items-center justify-between shrink-0 z-40 shadow-sm relative">
        <div className="flex items-center gap-6 w-1/3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-300 h-12 w-12">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="hidden lg:flex flex-col truncate">
            <h2 className="font-serif font-bold text-slate-950 text-xl truncate">{menuData.name}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest leading-none">Cloud Sync Active</span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-300 shadow-inner-3d">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'editor' ? 'bg-white text-slate-950 shadow-lg border-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Editor Ponuky
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'preview' ? 'bg-white text-slate-950 shadow-lg border-slate-300' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Náhľad Designu
          </button>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3">
           <Button variant="primary" size="md" onClick={handleSaveClick} className="rounded-2xl h-14 px-10 shadow-2xl bg-slate-950 border border-slate-800 text-white font-bold">
             Uložiť Projekt
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div 
          animate={{ x: activeTab === 'editor' ? 0 : '-100%', opacity: activeTab === 'editor' ? 1 : 0 }}
          className="w-full lg:w-[480px] bg-white border-r border-slate-300 overflow-y-auto p-10 space-y-14 pb-40 scrollbar-hide shadow-xl z-10"
        >
          <section className="space-y-8">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Globálny Design</h3>
            <div className="space-y-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2.5 px-1"><Globe className="w-4 h-4" /> Jazykové mutácie</label>
                  <div className="flex gap-2.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-300 shadow-inner-3d">
                     {AVAILABLE_LANGS.map(lang => (
                       <button 
                        key={lang} 
                        onClick={() => {
                          const nextLangs = menuData.activeLanguages.includes(lang)
                            ? menuData.activeLanguages.filter(l => l !== lang)
                            : [...menuData.activeLanguages, lang];
                          if (nextLangs.length > 0) updateMenuData({ activeLanguages: nextLangs });
                        }}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all border ${menuData.activeLanguages.includes(lang) ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}
                       >
                         {lang}
                       </button>
                     ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2.5 px-1"><Palette className="w-4 h-4" /> Farebný akcent</label>
                  <div className="flex gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-300 shadow-inner-3d">
                     {(Object.keys(accentColors) as AccentColor[]).map(c => (
                       <button 
                        key={c} 
                        onClick={() => updateMenuData({ accentColor: c })}
                        className={`flex-1 h-10 rounded-xl transition-all ${accentColors[c].bg} ${menuData.accentColor === c ? 'ring-2 ring-slate-950 ring-offset-2 scale-110 shadow-xl border border-white/40' : 'opacity-40 hover:opacity-100 border border-black/10'}`} 
                       />
                     ))}
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Štruktúra Menu</h3>
                <Button size="sm" variant="ghost" onClick={addItem} className="text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-300 font-bold"><Plus className="w-4.5 h-4.5 mr-2" /> Pridať položku</Button>
             </div>
             
             <div className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-6 shadow-brutal relative overflow-hidden group border border-slate-800">
               <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-600/40 transition-all" />
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]"><Sparkles className="w-4 h-4 animate-pulse" /> Generatívna AI</div>
                 <h4 className="text-xl font-serif font-bold tracking-tight">Vytvoriť koncept ponuky</h4>
                 <textarea 
                  value={uiState.prompt}
                  onChange={e => updateUiState({ prompt: e.target.value })}
                  placeholder="napr. Luxusný Steakhouse so zameraním na dry-aged hovädzie..."
                  className="w-full bg-white/5 border border-white/20 rounded-2xl p-5 text-xs text-white/95 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none shadow-inner transition-all placeholder:text-white/30 leading-relaxed border border-slate-700"
                 />
                 <Button variant="gradient" size="md" className="w-full h-14 rounded-2xl shadow-2xl border border-white/20 font-bold text-sm" onClick={handleGenerate} isLoading={uiState.isGenerating}>Vytvoriť Menu Koncept</Button>
               </div>
             </div>

             <div className="space-y-5 pt-4">
                {menuData.items.map(item => (
                  <div key={item.id} className="group bg-white hover:bg-slate-50 border border-slate-300 hover:border-indigo-400 p-6 rounded-3xl flex items-center gap-5 transition-all hover:shadow-lg cursor-default shadow-sm">
                     <GripVertical className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                     <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-950 truncate">{item.label}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-0.5">{item.price || 'Bez ceny'}</p>
                     </div>
                     <button onClick={() => updateUiState({ editingItemId: item.id })} className="p-3 bg-white text-slate-600 hover:text-indigo-700 rounded-2xl shadow-md border border-slate-300 hover:border-indigo-300 transition-all"><Edit2 className="w-5 h-5" /></button>
                  </div>
                ))}
             </div>
          </section>
        </motion.div>

        {/* Live Preview Area Area */}
        <div className="flex-1 bg-slate-200/40 p-10 md:p-16 overflow-hidden flex flex-col items-center gap-12 relative shadow-inner">
           <div className="bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-3xl shadow-brutal border border-slate-300 flex gap-10 items-center z-20">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-300 shadow-inner-3d">
                 <button onClick={() => updateUiState({ previewDevice: 'desktop' })} className={`p-3 rounded-xl transition-all ${uiState.previewDevice === 'desktop' ? 'bg-white shadow-lg border border-slate-300' : 'text-slate-500 hover:text-slate-800'}`}><Monitor className="w-5 h-5" /></button>
                 <button onClick={() => updateUiState({ previewDevice: 'mobile' })} className={`p-3 rounded-xl transition-all ${uiState.previewDevice === 'mobile' ? 'bg-white shadow-lg border border-slate-300' : 'text-slate-500 hover:text-slate-800'}`}><Smartphone className="w-5 h-5" /></button>
              </div>
              <div className="flex gap-3">
                 {['glass', 'dark', 'light'].map(t => (
                   <button 
                    key={t} 
                    onClick={() => updateMenuData({ theme: t as MenuTheme })}
                    className={`text-[10px] font-bold uppercase tracking-[0.3em] px-5 py-2.5 rounded-xl transition-all border ${menuData.theme === t ? 'bg-slate-950 text-white border-slate-800 shadow-xl' : 'bg-white/70 text-slate-500 border-slate-300 hover:bg-white hover:text-slate-950'}`}
                   >
                     {t}
                   </button>
                 ))}
              </div>
           </div>

           <div className={`transition-all duration-700 bg-white shadow-[0_80px_160px_rgba(0,0,0,0.3)] relative overflow-hidden border border-slate-400 ${uiState.previewDevice === 'mobile' ? 'w-[390px] h-[844px] rounded-[4rem] border-[16px] border-slate-950 shadow-[0_50px_100px_rgba(0,0,0,0.5)] ring-2 ring-slate-800' : 'w-full h-full rounded-[4rem]'}`}>
              <MenuPreview menu={{ ...menuData, id: 'preview', createdAt: 0 } as Menu} />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {uiState.editingItemId && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => updateUiState({ editingItemId: null })} className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl" />
             <motion.div layoutId="item-modal" className="relative w-full max-w-5xl bg-white rounded-[4rem] shadow-[0_60px_120px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[92dvh] border border-slate-300">
                <div className="p-12 border-b border-slate-300 flex items-center justify-between bg-slate-50/80">
                   <div className="flex items-center gap-7">
                      <div className={`w-16 h-16 rounded-3xl ${currentAccent.bg} text-white flex items-center justify-center shadow-2xl border border-black/20`}><Settings className="w-8 h-8" /></div>
                      <div>
                         <h2 className="text-4xl font-serif font-bold text-slate-950 tracking-tight">Editor kulinárnej položky</h2>
                         <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.3em] mt-1">Precízna správa kulinárskeho portfólia</p>
                      </div>
                   </div>
                   <button onClick={() => updateUiState({ editingItemId: null })} className="p-5 hover:bg-slate-100 rounded-full transition-all border border-transparent hover:border-slate-300 text-slate-400 hover:text-slate-950"><X className="w-8 h-8" /></button>
                </div>

                <div className="p-12 overflow-y-auto space-y-14 scrollbar-hide">
                   <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-[1.8rem] w-fit border border-slate-300 shadow-inner-3d">
                      {menuData.activeLanguages.map(lang => (
                        <button 
                          key={lang}
                          onClick={() => setEditingLang(lang)}
                          className={`px-10 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all border ${editingLang === lang ? 'bg-white text-slate-950 shadow-xl border-slate-400' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          {lang}
                        </button>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
                      <div className="space-y-10">
                         <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2"><TypeIcon className="w-4 h-4" /> Názov položky ({editingLang.toUpperCase()})</label>
                            <input 
                              value={editingItem.translations?.[editingLang]?.label || (editingLang === 'sk' ? editingItem.label : '')} 
                              onChange={(e) => updateItemTranslation(editingItem.id, editingLang, 'label', e.target.value)} 
                              className="w-full bg-slate-50 border border-slate-300 rounded-[1.8rem] px-8 py-6 text-base font-bold focus:bg-white focus:ring-8 focus:ring-indigo-500/10 transition-all outline-none shadow-inner-3d focus:border-indigo-500" 
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Exkluzívna cena</label>
                            <input value={editingItem.price || ''} onChange={(e) => updateItem(editingItem.id, { price: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-[1.8rem] px-8 py-6 text-base font-serif italic focus:bg-white shadow-inner-3d transition-all outline-none focus:border-indigo-500" placeholder="€0.00" />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Smart Scheduling</label>
                            <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100 rounded-[2rem] border border-slate-300">
                               {(['breakfast', 'lunch', 'dinner', 'all'] as MealTime[]).map(time => (
                                 <button key={time} onClick={() => updateItem(editingItem.id, { schedule: time })} className={`px-6 py-4.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all border ${editingItem.schedule === time ? 'bg-slate-950 text-white border-slate-800 shadow-2xl' : 'bg-white/80 text-slate-600 border-slate-300 hover:bg-white hover:text-slate-950 shadow-sm'}`}>
                                   {time}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-10">
                         <div className="space-y-6">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2"><Star className="w-4 h-4" /> Prémiové markery</label>
                            <div className="grid grid-cols-1 gap-5">
                               <button 
                                onClick={() => updateItem(editingItem.id, { isChefChoice: !editingItem.isChefChoice })}
                                className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all ${editingItem.isChefChoice ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-300 hover:border-slate-400 shadow-sm'}`}
                               >
                                 <div className="flex items-center gap-4">
                                   <div className={`p-3 rounded-2xl ${editingItem.isChefChoice ? 'bg-amber-200 text-amber-900 shadow-inner' : 'bg-slate-200 text-slate-500 shadow-inner'}`}><Star className="w-6 h-6" /></div>
                                   <div className="text-left">
                                      <span className="block text-[11px] font-bold uppercase tracking-widest">Chef's Choice</span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Špeciálna odporúčaná položka</span>
                                   </div>
                                 </div>
                                 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${editingItem.isChefChoice ? 'bg-amber-500 border-amber-600 shadow-lg shadow-amber-500/30' : 'border-slate-400'}`}>
                                   {editingItem.isChefChoice && <div className="w-3 h-3 bg-white rounded-full shadow-sm" />}
                                 </div>
                               </button>
                               <button 
                                onClick={() => updateItem(editingItem.id, { isLimitedEdition: !editingItem.isLimitedEdition })}
                                className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all ${editingItem.isLimitedEdition ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-300 hover:border-slate-400 shadow-sm'}`}
                               >
                                 <div className="flex items-center gap-4">
                                   <div className={`p-3 rounded-2xl ${editingItem.isLimitedEdition ? 'bg-rose-200 text-rose-900 shadow-inner' : 'bg-slate-200 text-slate-500 shadow-inner'}`}><Zap className="w-6 h-6" /></div>
                                   <div className="text-left">
                                      <span className="block text-[11px] font-bold uppercase tracking-widest">Limitovaná edícia</span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Iba do vypredania zásob</span>
                                   </div>
                                 </div>
                                 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${editingItem.isLimitedEdition ? 'bg-rose-500 border-rose-600 shadow-lg shadow-rose-500/30' : 'border-slate-400'}`}>
                                   {editingItem.isLimitedEdition && <div className="w-3 h-3 bg-white rounded-full shadow-sm" />}
                                 </div>
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex items-center justify-between px-1">
                         <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2"><Info className="w-4 h-4" /> Kulinársky popis ({editingLang.toUpperCase()})</label>
                         <button 
                          onClick={async () => {
                            updateUiState({ isGeneratingDesc: true });
                            const desc = await generateDishDescription(editingItem.translations?.[editingLang]?.label || editingItem.label);
                            updateItemTranslation(editingItem.id, editingLang, 'description', desc);
                            updateUiState({ isGeneratingDesc: false });
                          }}
                          className="flex items-center gap-3 text-indigo-700 text-[11px] font-bold uppercase tracking-widest hover:text-indigo-950 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-300 hover:border-indigo-500 transition-all shadow-xl active:scale-95"
                         >
                           <Sparkles className={`w-4.5 h-4.5 ${uiState.isGeneratingDesc ? 'animate-spin' : ''}`} /> {uiState.isGeneratingDesc ? 'Skladám text...' : 'AI Poetický Popis'}
                         </button>
                      </div>
                      <textarea 
                        value={editingItem.translations?.[editingLang]?.description || (editingLang === 'sk' ? editingItem.description : '')} 
                        onChange={(e) => updateItemTranslation(editingItem.id, editingLang, 'description', e.target.value)} 
                        className="w-full h-44 bg-slate-50 border border-slate-300 rounded-[2.5rem] p-10 text-lg italic font-light outline-none focus:bg-white focus:border-indigo-600 shadow-inner-3d transition-all resize-none scrollbar-hide leading-relaxed" 
                        placeholder="Zadajte poetický a zmyselný popis vášho pokrmu, ktorý nadchne hostí..." 
                      />
                   </div>
                </div>

                <div className="p-12 bg-slate-950 border-t border-slate-800 flex gap-6 shrink-0 shadow-2xl">
                   <Button variant="primary" className="flex-1 h-20 rounded-3xl text-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-[0_20px_40px_rgba(79,70,229,0.4)] font-bold" onClick={() => updateUiState({ editingItemId: null })}>Uložiť zmeny a Syncovať</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};