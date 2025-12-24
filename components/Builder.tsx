
import React, { useState, useCallback, useMemo, Suspense, lazy, useRef } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, GripVertical, Plus, Trash2, 
  Sparkles, Save, Edit2, X, DollarSign,
  Monitor, Smartphone, Type as TypeIcon, Image as ImageIcon,
  UtensilsCrossed, Tag, Wine, Leaf, RefreshCw, RotateCcw, RotateCw, FileDown, Languages, Utensils,
  Settings
} from 'lucide-react';
import { Menu, MenuItem, PlanTier, Language, FontFamily } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateDishDescription, recommendWinePairing, translateMenuItem } from '../services/geminiService';
import { accentColors } from '../utils/themeStyles';
import { useHistory } from '../hooks/useHistory';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const IconPicker = lazy(() => import('./IconPicker').then(module => ({ default: module.IconPicker })));

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'keto', 'paleo', 'bio'];
const ALLERGENS = Array.from({ length: 14 }, (_, i) => (i + 1).toString());

const FONTS: { id: FontFamily; label: string; pair: string }[] = [
  { id: 'serif', label: 'Classic Serif', pair: 'Playfair + Inter' },
  { id: 'sans', label: 'Modern Sans', pair: 'Inter + Inter' },
  { id: 'playfair', label: 'Prémiový Lux', pair: 'Playfair + Lato' },
  { id: 'montserrat', label: 'Montserrat', pair: 'Montserrat + Inter' },
  { id: 'cormorant', label: 'Artisan', pair: 'Cormorant + Lato' },
  { id: 'oswald', label: 'Bold Display', pair: 'Oswald + Sans' }
];

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
  
  const { 
    state: menuData, 
    setState: setMenuData, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<Omit<Menu, 'id' | 'createdAt'>>({
    name: initialData?.name || 'Nové Menu',
    items: initialData?.items || [],
    theme: initialData?.theme || 'glass',
    accentColor: initialData?.accentColor || 'indigo',
    fontFamily: initialData?.fontFamily || 'serif',
    baseFontSize: initialData?.baseFontSize || 16,
    borderRadius: initialData?.borderRadius || 'md',
    heroImageUrl: initialData?.heroImageUrl || '',
    activeLanguages: initialData?.activeLanguages || ['sk']
  });

  const [uiState, setUiState] = useState({
    prompt: '',
    isGenerating: false,
    isGeneratingDesc: false,
    isGeneratingWine: false,
    isTranslating: false,
    isExporting: false,
    editingItemId: null as string | null,
    previewDevice: 'desktop' as 'desktop' | 'mobile'
  });

  const updateMenuData = useCallback((updates: Partial<typeof menuData>) => {
    setMenuData(prev => ({ ...prev, ...updates }));
  }, [setMenuData]);

  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  }, [setMenuData]);

  const handleAutoTranslate = async (item: MenuItem) => {
    updateUiState({ isTranslating: true });
    const nextTranslations = { ...(item.translations || {}) };
    
    for (const lang of AVAILABLE_LANGS) {
      if (lang === 'sk') continue;
      if (!menuData.activeLanguages.includes(lang)) continue;

      const translatedLabel = await translateMenuItem(item.label, lang);
      const translatedDesc = item.description ? await translateMenuItem(item.description, lang) : '';
      const translatedPairing = item.pairing ? await translateMenuItem(item.pairing, lang) : '';

      nextTranslations[lang] = { 
        label: translatedLabel, 
        description: translatedDesc,
        pairing: translatedPairing
      };
    }

    updateItem(item.id, { translations: nextTranslations });
    updateUiState({ isTranslating: false });
  };

  const handleWinePairing = async (item: MenuItem) => {
    updateUiState({ isGeneratingWine: true });
    const pairing = await recommendWinePairing(item.label, item.description || '');
    updateItem(item.id, { pairing });
    updateUiState({ isGeneratingWine: false });
  };

  const handleExportPdf = async () => {
    updateUiState({ isExporting: true });
    try {
      const element = document.getElementById('menu-capture-area');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${menuData.name.toLowerCase().replace(/\s+/g, '-')}-menu.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      updateUiState({ isExporting: false });
    }
  };

  const handleHeroUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => updateMenuData({ heroImageUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const editingItem = useMemo(() => 
    menuData.items.find(i => i.id === uiState.editingItemId),
  [menuData.items, uiState.editingItemId]);

  const currentAccent = accentColors[menuData.accentColor] || accentColors.slate;

  return (
    <div className="h-dvh w-full flex flex-col bg-[#edf2f7] overflow-hidden">
      <header className="h-20 lg:h-24 px-4 md:px-10 bg-white border-b border-slate-300 flex items-center justify-between shrink-0 z-40 shadow-sm relative pt-safe">
        <div className="flex items-center gap-3 lg:gap-6 w-fit lg:w-1/3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col truncate max-w-[150px]">
            <h2 className="font-serif font-bold text-slate-950 text-sm lg:text-lg truncate">{menuData.name}</h2>
            <div className="flex gap-2 mt-0.5">
               <button onClick={undo} disabled={!canUndo} className="p-1 hover:bg-slate-100 rounded-md disabled:opacity-20 transition-all" title="Undo"><RotateCcw className="w-4 h-4 text-slate-400" /></button>
               <button onClick={redo} disabled={!canRedo} className="p-1 hover:bg-slate-100 rounded-md disabled:opacity-20 transition-all" title="Redo"><RotateCw className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300 shadow-inner">
          <button onClick={() => setActiveTab('editor')} className={`px-4 lg:px-8 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-white shadow-md text-slate-950 border border-slate-200' : 'text-slate-500'}`}>Editor</button>
          <button onClick={() => setActiveTab('preview')} className={`px-4 lg:px-8 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-white shadow-md text-slate-950 border border-slate-200' : 'text-slate-500'}`}>Náhľad</button>
        </div>

        <div className="hidden sm:flex items-center justify-end gap-3 w-1/3">
           <Button variant="secondary" size="md" onClick={handleExportPdf} isLoading={uiState.isExporting} className="rounded-xl border-slate-300 font-bold h-12">
             <FileDown className="w-4 h-4 mr-2" /> PDF
           </Button>
           <Button variant="primary" size="md" onClick={() => onSave({ ...menuData, id: menuId || crypto.randomUUID(), createdAt: Date.now() } as Menu)} className="rounded-xl bg-slate-950 text-white font-bold h-12 shadow-lg shadow-slate-900/20">Uložiť</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <motion.div 
          animate={{ x: activeTab === 'editor' ? 0 : '-100%', opacity: activeTab === 'editor' ? 1 : 0 }}
          className="w-full lg:w-[480px] bg-white border-r border-slate-300 overflow-y-auto p-6 md:p-8 space-y-12 pb-40 scrollbar-hide z-10"
        >
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Globálny Design</h3>
            
            <div className="space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><TypeIcon className="w-3 h-3" /> Písmo & Veľkosť</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">{menuData.baseFontSize}px</span>
                  </div>
                  <input 
                    type="range" min="12" max="24" step="1" 
                    value={menuData.baseFontSize} 
                    onChange={e => updateMenuData({ baseFontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                     {FONTS.map(f => (
                       <button 
                        key={f.id} 
                        onClick={() => updateMenuData({ fontFamily: f.id })}
                        className={`py-3 px-3 rounded-xl text-left border transition-all ${menuData.fontFamily === f.id ? 'bg-slate-950 text-white border-slate-950 shadow-xl scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                       >
                         <div className="text-[10px] font-bold mb-0.5">{f.label}</div>
                         <div className="text-[8px] opacity-60 uppercase tracking-widest">{f.pair}</div>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Hero Pozadie</label>
                  <div className="relative group h-36 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 flex items-center justify-center transition-all hover:border-slate-300">
                     {menuData.heroImageUrl ? (
                       <>
                        <img src={menuData.heroImageUrl} className="w-full h-full object-cover" alt="Hero" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-xl">Vymeniť<input type="file" className="hidden" onChange={e => e.target.files && handleHeroUpload(e.target.files[0])}/></label>
                        </div>
                       </>
                     ) : (
                       <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200"><ImageIcon className="w-5 h-5" /></div>
                          <label className="text-[10px] font-bold uppercase cursor-pointer text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">Nahrať Foto<input type="file" className="hidden" onChange={e => e.target.files && handleHeroUpload(e.target.files[0])}/></label>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Stavebné bloky</h3>
              <div className="flex gap-2">
                 <button onClick={() => {
                   const id = crypto.randomUUID();
                   updateMenuData({ items: [...menuData.items, { id, label: 'Nová Sekcia', type: 'section', url: '#', depth: 0, translations: { sk: { label: 'Nová Sekcia' } } }] });
                   updateUiState({ editingItemId: id });
                 }} className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Sekcia +</button>
                 <button onClick={() => {
                   const id = crypto.randomUUID();
                   updateMenuData({ items: [...menuData.items, { id, label: 'Nové jedlo', type: 'dish', url: '#', depth: 0, translations: { sk: { label: 'Nové jedlo' } } }] });
                   updateUiState({ editingItemId: id });
                 }} className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">Jedlo +</button>
              </div>
            </div>

            <Reorder.Group axis="y" values={menuData.items} onReorder={(items) => updateMenuData({ items })} className="space-y-3">
               {menuData.items.map(item => (
                 <Reorder.Item key={item.id} value={item} className={`p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 cursor-grab active:cursor-grabbing shadow-sm transition-all hover:shadow-md ${item.type === 'section' ? 'border-l-4 border-l-slate-900 bg-slate-50/50' : ''}`}>
                    <GripVertical className="w-4 h-4 text-slate-300" />
                    <div className="flex-1 truncate">
                       <span className={`text-sm font-semibold ${item.type === 'section' ? 'uppercase tracking-widest text-slate-900' : 'text-slate-700'}`}>{item.label}</span>
                    </div>
                    <button onClick={() => updateUiState({ editingItemId: item.id })} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Edit2 className="w-4 h-4 text-slate-400" /></button>
                 </Reorder.Item>
               ))}
            </Reorder.Group>
          </section>
        </motion.div>

        <div className="flex-1 bg-slate-200/40 p-4 lg:p-12 overflow-hidden flex flex-col items-center justify-center relative">
           <div className="absolute top-6 flex gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-xl z-20">
              <button onClick={() => updateUiState({ previewDevice: 'desktop' })} className={`p-2.5 rounded-xl transition-all ${uiState.previewDevice === 'desktop' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Monitor className="w-5 h-5" /></button>
              <button onClick={() => updateUiState({ previewDevice: 'mobile' })} className={`p-2.5 rounded-xl transition-all ${uiState.previewDevice === 'mobile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone className="w-5 h-5" /></button>
           </div>
           
           <div className={`transition-all duration-700 bg-white shadow-brutal relative overflow-hidden border border-slate-300 ${uiState.previewDevice === 'mobile' ? 'w-full max-w-[390px] h-full max-h-[844px] rounded-[3.5rem] border-[12px] border-slate-950' : 'w-full h-full rounded-[2.5rem]'}`}>
              <div id="menu-capture-area" className="w-full h-full overflow-hidden">
                <MenuPreview menu={{ ...menuData, id: 'preview', createdAt: 0 } as Menu} />
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {uiState.editingItemId && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center lg:p-10">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => updateUiState({ editingItemId: null })} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
             <motion.div 
               layoutId="item-modal" 
               className="relative w-full max-w-4xl bg-white rounded-t-[3rem] lg:rounded-[3.5rem] shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden border-t lg:border border-slate-200"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${currentAccent.bg} text-white flex items-center justify-center shadow-lg border border-black/10`}><Settings className="w-7 h-7" /></div>
                      <div>
                        <h2 className="text-2xl font-bold font-serif text-slate-900">{editingItem.label}</h2>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => updateItem(editingItem.id, { type: 'dish' })} className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-lg transition-all border ${editingItem.type !== 'section' ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'}`}>Jedlo</button>
                          <button onClick={() => updateItem(editingItem.id, { type: 'section' })} className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-lg transition-all border ${editingItem.type === 'section' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'}`}>Nadpis Sekcie</button>
                        </div>
                      </div>
                   </div>
                   <button onClick={() => updateUiState({ editingItemId: null })} className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full transition-all border border-transparent hover:border-slate-300"><X className="w-7 h-7 text-slate-500" /></button>
                </div>

                <div className="p-10 overflow-y-auto space-y-12 scrollbar-hide pb-32">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Názov Položky</label>
                            <div className="relative group">
                              <input value={editingItem.label} onChange={e => updateItem(editingItem.id, { label: e.target.value })} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xl shadow-inner" />
                              <button 
                                onClick={() => handleAutoTranslate(editingItem)} 
                                disabled={uiState.isTranslating}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                title="AI Preklad"
                              >
                                <Languages className={`w-4 h-4 ${uiState.isTranslating ? 'animate-pulse text-indigo-500' : ''}`} />
                              </button>
                            </div>
                         </div>
                         {editingItem.type !== 'section' && (
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Cena / Podnadpis</label>
                              <div className="relative">
                                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input value={editingItem.price || ''} onChange={e => updateItem(editingItem.id, { price: e.target.value })} className="w-full bg-slate-50 pl-12 p-5 rounded-2xl border border-slate-200 focus:bg-white outline-none italic font-serif text-xl shadow-inner" placeholder="0.00" />
                              </div>
                           </div>
                         )}

                         <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Alergény (1-14)</label>
                            <div className="grid grid-cols-7 gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-inner">
                               {ALLERGENS.map(num => (
                                 <button 
                                  key={num} 
                                  onClick={() => {
                                    const next = (editingItem.allergens || []).includes(num) ? (editingItem.allergens || []).filter(n => n !== num) : [...(editingItem.allergens || []), num];
                                    updateItem(editingItem.id, { allergens: next });
                                  }}
                                  className={`w-10 h-10 rounded-xl text-[12px] font-bold border transition-all flex items-center justify-center ${editingItem.allergens?.includes(num) ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-110' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                 >
                                   {num}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Diétne štítky</label>
                            <div className="flex flex-wrap gap-2 bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner">
                               {DIETARY_OPTIONS.map(tag => (
                                 <button 
                                  key={tag} 
                                  onClick={() => {
                                    const next = (editingItem.dietaryTags || []).includes(tag) ? (editingItem.dietaryTags || []).filter(t => t !== tag) : [...(editingItem.dietaryTags || []), tag];
                                    updateItem(editingItem.id, { dietaryTags: next });
                                  }}
                                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase border transition-all ${editingItem.dietaryTags?.includes(tag) ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                 >
                                   {tag}
                                 </button>
                               ))}
                            </div>
                         </div>

                         {editingItem.type !== 'section' && (
                           <div className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 tracking-widest"><Wine className="w-3.5 h-3.5" /> AI Somelier</label>
                                <button 
                                  onClick={() => handleWinePairing(editingItem)} 
                                  disabled={uiState.isGeneratingWine}
                                  className="text-[9px] font-bold uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm"
                                >
                                  {uiState.isGeneratingWine ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Odporučiť víno'}
                                </button>
                              </div>
                              <textarea 
                                value={editingItem.pairing || ''} 
                                onChange={e => updateItem(editingItem.id, { pairing: e.target.value })}
                                className="w-full h-28 bg-indigo-50/30 border border-indigo-100 rounded-3xl p-5 italic text-sm text-indigo-900 outline-none focus:bg-white transition-all resize-none shadow-inner"
                                placeholder="Párovanie k vínu a chuťové tóny..."
                              />
                           </div>
                         )}
                      </div>
                   </div>

                   {editingItem.type !== 'section' && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-1">Gastronomický Popis</label>
                        <textarea 
                          value={editingItem.description || ''} 
                          onChange={e => updateItem(editingItem.id, { description: e.target.value })} 
                          className="w-full h-40 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 focus:bg-white outline-none text-lg italic leading-relaxed shadow-inner" 
                          placeholder="Popíšte ingrediencie, prípravu a emóciu jedla..."
                        />
                    </div>
                   )}
                </div>

                <div className="p-8 bg-slate-950 border-t border-slate-800 flex gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                   <Button variant="primary" className="flex-1 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-20 text-xl border border-indigo-400/20" onClick={() => updateUiState({ editingItemId: null })}>Uložiť & Synchronizovať</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
