import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, GripVertical, Plus, Trash2, 
  Sparkles, Save, Palette, Layers, Eye, Smile, Edit2, Zap,
  Settings, Type as TypeIcon, X, DollarSign,
  Monitor, Smartphone, Clock, Info, Star, Globe, Image as ImageIcon,
  ChevronRight, UtensilsCrossed, Tag
} from 'lucide-react';
import { Menu, MenuItem, MenuTheme, AiGeneratedItem, PlanTier, AccentColor, MealTime, Language, ItemType } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateMenuStructure, generateDishDescription } from '../services/geminiService';
import { accentColors } from '../utils/themeStyles';
import { iconMap } from '../utils/icons';

const IconPicker = lazy(() => import('./IconPicker').then(module => ({ default: module.IconPicker })));

interface BuilderProps {
  menuId: string | null;
  onBack: () => void;
  onSave: (menu: Menu) => void;
  initialData?: Menu;
  currentPlan: PlanTier;
  onUpgrade: () => void;
}

const AVAILABLE_LANGS: Language[] = ['sk', 'en', 'de'];

export const Builder: React.FC<BuilderProps> = ({ menuId, onBack, onSave, initialData }) => {
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

  const handleReorder = (newItems: MenuItem[]) => {
    updateMenuData({ items: newItems });
  };

  const updateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  }, []);

  const removeItem = (id: string) => {
    setMenuData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

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

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateItem(id, { image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addItem = (type: ItemType = 'dish') => {
    const id = crypto.randomUUID();
    const newItem: MenuItem = { 
      id, 
      type,
      label: type === 'section' ? 'Nová Sekcia' : 'Nové Jedlo', 
      url: '#', 
      depth: 0, 
      schedule: 'all', 
      translations: { sk: { label: type === 'section' ? 'Nová Sekcia' : 'Nové Jedlo' } } 
    };
    setMenuData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setUiState(prev => ({ ...prev, editingItemId: id }));
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
          type: node.children && node.children.length > 0 ? 'section' : 'dish',
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

  const editingItem = useMemo(() => 
    menuData.items.find(i => i.id === uiState.editingItemId),
  [menuData.items, uiState.editingItemId]);

  const currentAccent = accentColors[menuData.accentColor] || accentColors.slate;

  return (
    <div className="h-dvh w-full flex flex-col bg-[#edf2f7] overflow-hidden">
      <header className="h-20 lg:h-24 px-4 md:px-10 bg-white border-b border-slate-300 flex items-center justify-between shrink-0 z-40 shadow-sm relative pt-safe">
        <div className="flex items-center gap-3 lg:gap-6 w-fit lg:w-1/3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl lg:rounded-2xl h-10 w-10 lg:h-12 lg:w-12">
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </Button>
          <div className="flex flex-col truncate max-w-[120px] lg:max-w-none">
            <h2 className="font-serif font-bold text-slate-950 text-sm lg:text-xl truncate">{menuData.name}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[8px] lg:text-[10px] text-emerald-700 font-bold uppercase tracking-widest leading-none">Pro Studio</span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl lg:rounded-2xl border border-slate-300 shadow-inner-3d">
          <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-4 lg:px-10 py-2 lg:py-3 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'editor' ? 'bg-white text-slate-950 shadow-lg border-slate-300' : 'text-slate-500 hover:text-slate-800'}`}>Editor</button>
          <button onClick={() => setActiveTab('preview')} className={`flex items-center gap-2 px-4 lg:px-10 py-2 lg:py-3 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'preview' ? 'bg-white text-slate-950 shadow-lg border-slate-300' : 'text-slate-500 hover:text-slate-800'}`}>Náhľad</button>
        </div>

        <div className="hidden sm:flex items-center justify-end gap-4 w-1/3">
           <Button variant="primary" size="md" onClick={() => onSave({ ...menuData, id: menuId || crypto.randomUUID(), createdAt: initialData?.createdAt || Date.now() } as Menu)} className="rounded-xl lg:rounded-2xl h-10 lg:h-14 px-4 lg:px-10 shadow-xl lg:shadow-2xl bg-slate-950 border border-slate-800 text-white font-bold text-xs lg:text-sm">
             <Save className="w-4 h-4 lg:mr-2" /> Uložiť
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <motion.div 
          animate={{ x: activeTab === 'editor' ? 0 : '-100%', opacity: activeTab === 'editor' ? 1 : 0 }}
          className="w-full lg:w-[480px] bg-white border-r border-slate-300 overflow-y-auto p-6 md:p-10 space-y-10 md:space-y-14 pb-40 scrollbar-hide shadow-xl z-10 absolute inset-0 lg:relative"
        >
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Design & Jazyky</h3>
            </div>
            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-300 shadow-inner-3d">
              {AVAILABLE_LANGS.map(lang => (
                <button 
                  key={lang} 
                  onClick={() => {
                    const nextLangs = menuData.activeLanguages.includes(lang) ? menuData.activeLanguages.filter(l => l !== lang) : [...menuData.activeLanguages, lang];
                    if (nextLangs.length > 0) updateMenuData({ activeLanguages: nextLangs });
                  }}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${menuData.activeLanguages.includes(lang) ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Štruktúra</h3>
                <div className="flex gap-2">
                   <Button size="sm" variant="ghost" onClick={() => addItem('section')} className="text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold"><Layers className="w-4 h-4 mr-2" /> Sekcia</Button>
                   <Button size="sm" variant="ghost" onClick={() => addItem('dish')} className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-bold"><Plus className="w-4 h-4 mr-2" /> Jedlo</Button>
                </div>
             </div>
             
             <Reorder.Group axis="y" values={menuData.items} onReorder={handleReorder} className="space-y-4">
               {menuData.items.map(item => (
                 <Reorder.Item 
                  key={item.id} 
                  value={item}
                  className={`group bg-white hover:bg-slate-50 border transition-all rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm ${item.type === 'section' ? 'border-slate-400 bg-slate-50/50' : 'border-slate-200'}`}
                 >
                    <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                          {item.type === 'section' ? <Tag className="w-3 h-3 text-slate-400" /> : <UtensilsCrossed className="w-3 h-3 text-indigo-400" />}
                          <p className={`truncate font-bold ${item.type === 'section' ? 'text-sm text-slate-900 uppercase tracking-widest' : 'text-base text-slate-700'}`}>{item.label}</p>
                       </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => updateUiState({ editingItemId: item.id })} className="p-2.5 bg-white text-slate-500 hover:text-indigo-600 rounded-xl border border-slate-200 shadow-sm"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => removeItem(item.id)} className="p-2.5 bg-white text-slate-300 hover:text-rose-600 rounded-xl border border-slate-200 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 </Reorder.Item>
               ))}
             </Reorder.Group>
          </section>
        </motion.div>

        <div className={`flex-1 bg-slate-200/40 p-4 md:p-10 lg:p-16 overflow-hidden flex flex-col items-center gap-6 lg:gap-12 relative shadow-inner absolute inset-0 lg:relative transition-transform duration-500 ${activeTab === 'preview' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
           <div className={`transition-all duration-700 bg-white shadow-[0_80px_160px_rgba(0,0,0,0.3)] relative overflow-hidden border border-slate-400 ${uiState.previewDevice === 'mobile' ? 'w-full max-w-[390px] h-full max-h-[844px] rounded-[2.5rem] lg:rounded-[4rem] border-[8px] lg:border-[16px] border-slate-950 shadow-[0_50px_100px_rgba(0,0,0,0.5)] ring-2 ring-slate-800' : 'w-full h-full rounded-[2rem] lg:rounded-[4rem]'}`}>
              <MenuPreview menu={{ ...menuData, id: 'preview', createdAt: 0 } as Menu} />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {uiState.editingItemId && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center lg:p-8">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => updateUiState({ editingItemId: null })} className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl" />
             <motion.div 
               layoutId="item-modal" 
               initial={{ opacity: 0, scale: 0.95, y: '100%' }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: '100%' }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="relative w-full max-w-5xl bg-white rounded-t-[3rem] lg:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] border-t lg:border border-slate-300"
             >
                <div className="p-6 lg:p-12 border-b border-slate-300 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                   <div className="flex items-center gap-4 lg:gap-7">
                      <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl ${currentAccent.bg} text-white flex items-center justify-center shadow-lg border border-black/20`}><Settings className="w-6 h-6 lg:w-8 lg:h-8" /></div>
                      <h2 className="text-xl lg:text-4xl font-serif font-bold text-slate-950 tracking-tight">{editingItem.type === 'section' ? 'Editor Sekcie' : 'Editor Jedla'}</h2>
                   </div>
                   <button onClick={() => updateUiState({ editingItemId: null })} className="p-3 lg:p-5 hover:bg-slate-100 rounded-full transition-all border border-transparent hover:border-slate-300 text-slate-400 hover:text-slate-950"><X className="w-6 h-6 lg:w-8 lg:h-8" /></button>
                </div>

                <div className="p-6 lg:p-12 overflow-y-auto space-y-10 lg:space-y-14 scrollbar-hide pb-32">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                      <div className="space-y-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">Názov ({editingLang.toUpperCase()})</label>
                            <input 
                              value={editingItem.translations?.[editingLang]?.label || (editingLang === 'sk' ? editingItem.label : '')} 
                              onChange={(e) => updateItemTranslation(editingItem.id, editingLang, 'label', e.target.value)} 
                              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-6 py-4 font-bold focus:bg-white shadow-inner-3d outline-none" 
                            />
                         </div>
                         {editingItem.type === 'dish' && (
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">Cena</label>
                              <input value={editingItem.price || ''} onChange={(e) => updateItem(editingItem.id, { price: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-6 py-4 italic font-serif" placeholder="€0.00" />
                           </div>
                         )}
                         <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">Obrázok Položky</label>
                            <div className="flex items-center gap-5">
                               <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative group">
                                  {editingItem.image ? (
                                    <img src={editingItem.image} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-300" />
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => e.target.files && handleImageUpload(editingItem.id, e.target.files[0])}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <p className="text-xs text-slate-500 font-medium">Nahrajte lákavú fotografiu jedla.</p>
                                  {editingItem.image && <button onClick={() => updateItem(editingItem.id, { image: undefined })} className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Odstrániť</button>}
                               </div>
                            </div>
                         </div>
                      </div>

                      {editingItem.type === 'dish' && (
                        <div className="space-y-10">
                           <div className="space-y-6">
                              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">Popis Jedla</label>
                              <div className="relative">
                                <textarea 
                                  value={uiState.isGeneratingDesc ? '' : (editingItem.translations?.[editingLang]?.description || (editingLang === 'sk' ? editingItem.description : ''))} 
                                  onChange={(e) => updateItemTranslation(editingItem.id, editingLang, 'description', e.target.value)} 
                                  className="w-full h-40 bg-slate-50 border border-slate-300 rounded-2xl p-6 italic outline-none focus:bg-white transition-all resize-none" 
                                  placeholder="Popíšte ingrediencie a zážitok..." 
                                />
                                <button 
                                  onClick={async () => {
                                    updateUiState({ isGeneratingDesc: true });
                                    const desc = await generateDishDescription(editingItem.translations?.[editingLang]?.label || editingItem.label);
                                    updateItemTranslation(editingItem.id, editingLang, 'description', desc);
                                    updateUiState({ isGeneratingDesc: false });
                                  }}
                                  className="absolute bottom-4 right-4 bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all"
                                >
                                  <Sparkles className={`w-4 h-4 ${uiState.isGeneratingDesc ? 'animate-spin' : ''}`} />
                                </button>
                              </div>
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="p-6 lg:p-12 bg-slate-950 border-t border-slate-800 flex gap-4 shrink-0 shadow-2xl sticky bottom-0 z-10">
                   <Button variant="primary" className="flex-1 h-14 lg:h-20 rounded-2xl lg:rounded-3xl text-sm lg:text-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-xl font-bold" onClick={() => updateUiState({ editingItemId: null })}>Uložiť</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};