
import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, GripVertical, Plus, Trash2, 
  Sparkles, Edit2, X, DollarSign,
  Monitor, Smartphone, Type as TypeIcon, Image as ImageIcon,
  Wine, Leaf, RefreshCw, RotateCcw, RotateCw, FileDown, Languages, Utensils,
  Settings, Search, Camera, Globe, ExternalLink, Palette, Clock, Calendar
} from 'lucide-react';
import { Menu, MenuItem, PlanTier, Language, FontFamily, AiGeneratedItem, MenuTheme } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { recommendWinePairing, translateMenuItem, generateMenuStructure, generateDishImage, getGastronomyTrends, suggestSchedule } from '../services/geminiService';
import { accentColors } from '../utils/themeStyles';
import { useHistory } from '../hooks/useHistory';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { iconMap } from '../utils/icons';

const IconPicker = lazy(() => import('./IconPicker').then(module => ({ default: module.IconPicker })));

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'keto', 'paleo', 'bio'];
const ALLERGENS = Array.from({ length: 14 }, (_, i) => (i + 1).toString());
const DAYS = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'];

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
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  
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
    trendPrompt: '',
    isGenerating: false,
    isGeneratingTrends: false,
    isGeneratingWine: false,
    isGeneratingImage: false,
    isGeneratingSchedule: false,
    isTranslating: false,
    isExporting: false,
    editingItemId: null as string | null,
    previewDevice: 'desktop' as 'desktop' | 'mobile',
    trends: null as { text: string; sources: { title: string; uri: string }[] } | null
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

  const handleMagicGenerate = async () => {
    if (!uiState.prompt.trim()) return;
    updateUiState({ isGenerating: true });
    try {
      const structure = await generateMenuStructure(uiState.prompt);
      const newItems: MenuItem[] = structure.map((item: any) => ({
        id: crypto.randomUUID(),
        label: item.label,
        description: item.description,
        price: item.price,
        url: item.url || '#',
        type: item.type || 'dish',
        depth: 0,
        translations: { sk: { label: item.label, description: item.description } }
      }));
      updateMenuData({ items: [...menuData.items, ...newItems] });
      updateUiState({ prompt: '' });
    } finally {
      updateUiState({ isGenerating: false });
    }
  };

  const handleSearchTrends = async () => {
    if (!uiState.trendPrompt.trim()) return;
    updateUiState({ isGeneratingTrends: true });
    try {
      const trends = await getGastronomyTrends(uiState.trendPrompt);
      updateUiState({ trends });
    } finally {
      updateUiState({ isGeneratingTrends: false });
    }
  };

  const handleAiPhotoGenerate = async (item: MenuItem) => {
    updateUiState({ isGeneratingImage: true });
    try {
      const imageData = await generateDishImage(item.label, item.description || '');
      if (imageData) {
        updateItem(item.id, { image: imageData });
      }
    } finally {
      updateUiState({ isGeneratingImage: false });
    }
  };

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

  const handleAiSchedule = async (item: MenuItem) => {
    updateUiState({ isGeneratingSchedule: true });
    const schedule = await suggestSchedule(item.label, item.description || '');
    if (schedule) {
      updateItem(item.id, { availability: schedule });
    }
    updateUiState({ isGeneratingSchedule: false });
  };

  const handleExportPdf = async () => {
    updateUiState({ isExporting: true });
    try {
      const element = document.getElementById('menu-capture-area');
      if (!element) return;

      // Fix pre corrupt PNG:html2canvas potrebuje povolené CORS a vypnuté proxy
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${menuData.name.toLowerCase().replace(/\s+/g, '-')}-menu.pdf`);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      updateUiState({ isExporting: false });
    }
  };

  const handleItemImageUpload = (id: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => updateItem(id, { image: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleHeroUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => updateMenuData({ heroImageUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const editingItem = useMemo(() => 
    menuData.items.find(i => i.id === uiState.editingItemId),
  [menuData.items, uiState.editingItemId]);

  const currentAccent = accentColors[menuData.accentColor] || accentColors.slate;
  const SelectedIcon = editingItem?.icon ? iconMap[editingItem.icon] : null;

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
             <FileDown className="w-4 h-4 mr-2" /> PDF Export
           </Button>
           <Button variant="primary" size="md" onClick={() => onSave({ ...menuData, id: menuId || crypto.randomUUID(), createdAt: Date.now() } as Menu)} className="rounded-xl bg-slate-950 text-white font-bold h-12 shadow-lg shadow-slate-900/20">Uložiť</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <MotionDiv 
          animate={{ x: activeTab === 'editor' ? 0 : '-100%', opacity: activeTab === 'editor' ? 1 : 0 }}
          className="w-full lg:w-[480px] bg-white border-r border-slate-300 overflow-y-auto p-6 md:p-8 space-y-12 pb-40 scrollbar-hide z-10"
        >
          {/* AI Trends Module */}
          <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4" /></div>
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Trendy z webu (AI Search)</h3>
             </div>
             <div className="flex gap-2">
                <input 
                  value={uiState.trendPrompt} 
                  onChange={e => updateUiState({ trendPrompt: e.target.value })}
                  placeholder="Hľadať trendy (napr. dezerty 2024)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button 
                  onClick={handleSearchTrends} 
                  disabled={uiState.isGeneratingTrends}
                  className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {uiState.isGeneratingTrends ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
             </div>
             {uiState.trends && (
               <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] leading-relaxed text-slate-600">
                  <p className="mb-3 font-medium">{uiState.trends.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {uiState.trends.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-all text-indigo-600">
                        <ExternalLink className="w-2.5 h-2.5" /> Zdroj {i+1}
                      </a>
                    ))}
                  </div>
               </div>
             )}
          </section>

          {/* AI Generation Input */}
          <section className="bg-slate-950 rounded-[2.5rem] p-6 text-white space-y-4 shadow-xl shadow-slate-900/40 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Sparkles className="w-20 h-20" /></div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5" /></div>
               <h3 className="text-sm font-bold uppercase tracking-widest">AI Architekt Menu</h3>
             </div>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">Napíšte koncept (napr. ázijský fusion) a my vygenerujeme štruktúru.</p>
             <div className="relative">
                <input 
                  value={uiState.prompt} 
                  onChange={e => updateUiState({ prompt: e.target.value })}
                  placeholder="Popíšte vašu reštauráciu..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button onClick={handleMagicGenerate} disabled={uiState.isGenerating} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50">
                   {uiState.isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
             </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Globálny Design</h3>
            
            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Motív Menu
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['glass', 'light', 'dark', 'neon'].map(t => (
                      <button 
                        key={t}
                        onClick={() => updateMenuData({ theme: t as MenuTheme })}
                        className={`h-10 rounded-xl border transition-all ${menuData.theme === t ? 'ring-2 ring-indigo-500 border-transparent scale-105' : 'border-slate-200 hover:border-slate-300'}`}
                        style={{ background: t === 'dark' ? '#0f172a' : t === 'neon' ? '#000' : t === 'glass' ? '#f8fafc' : '#fff' }}
                        title={t.charAt(0).toUpperCase() + t.slice(1)}
                      />
                    ))}
                  </div>
               </div>

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
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Hlavné Pozadie (Hero)</label>
                  <div className="relative group h-36 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 flex items-center justify-center transition-all hover:border-slate-300">
                     {menuData.heroImageUrl ? (
                       <>
                        <img 
                          src={menuData.heroImageUrl} 
                          className="w-full h-full object-cover" 
                          alt="Hero" 
                          crossOrigin="anonymous"
                          onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800")} 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-xl">Vymeniť<input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleHeroUpload(e.target.files[0])}/></label>
                        </div>
                       </>
                     ) : (
                       <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200"><ImageIcon className="w-5 h-5" /></div>
                          <label className="text-[10px] font-bold uppercase cursor-pointer text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">Nahrať Foto<input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleHeroUpload(e.target.files[0])}/></label>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Položky Menu</h3>
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
               {menuData.items.map(item => {
                 const ListIcon = item.icon ? iconMap[item.icon] : null;
                 return (
                 <Reorder.Item key={item.id} value={item} className={`p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 cursor-grab active:cursor-grabbing shadow-sm transition-all hover:shadow-md ${item.type === 'section' ? 'border-l-4 border-l-slate-900 bg-slate-50/50' : ''}`}>
                    <GripVertical className="w-4 h-4 text-slate-300" />
                    <div className="flex-1 truncate flex items-center gap-3">
                       {ListIcon && <ListIcon className="w-4 h-4 text-slate-500" />}
                       <span className={`text-sm font-semibold ${item.type === 'section' ? 'uppercase tracking-widest text-slate-900' : 'text-slate-700'}`}>{item.label}</span>
                    </div>
                    <button onClick={() => updateUiState({ editingItemId: item.id })} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Edit2 className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={() => updateMenuData({ items: menuData.items.filter(i => i.id !== item.id) })} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                 </Reorder.Item>
               )})}
            </Reorder.Group>
          </section>
        </MotionDiv>

        <div className="flex-1 bg-slate-200/40 p-4 lg:p-12 overflow-hidden flex flex-col items-center justify-center relative">
           <div className="absolute top-6 flex gap-2 bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/50 shadow-xl z-20">
              <button 
                onClick={() => updateUiState({ previewDevice: 'desktop' })} 
                className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${uiState.previewDevice === 'desktop' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Desktop View"
              >
                <Monitor className="w-5 h-5" />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${uiState.previewDevice === 'desktop' ? 'block' : 'hidden'}`}>Desktop</span>
              </button>
              <button 
                onClick={() => updateUiState({ previewDevice: 'mobile' })} 
                className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${uiState.previewDevice === 'mobile' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Mobile View"
              >
                <Smartphone className="w-5 h-5" />
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${uiState.previewDevice === 'mobile' ? 'block' : 'hidden'}`}>Mobile</span>
              </button>
           </div>
           
           <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white shadow-2xl relative overflow-hidden ${uiState.previewDevice === 'mobile' ? 'w-[390px] h-[844px] rounded-[3rem] border-[14px] border-slate-950 ring-4 ring-slate-950/10' : 'w-full h-full rounded-[2rem] border border-slate-200'}`}>
              
              {/* Mobile Notch Simulation */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-7 w-40 bg-slate-950 rounded-b-2xl z-50 transition-all duration-500 ${uiState.previewDevice === 'mobile' ? 'translate-y-0' : '-translate-y-full'}`} />
              
              <div id="menu-capture-area" className="w-full h-full overflow-hidden bg-white">
                <MenuPreview menu={{ ...menuData, id: 'preview', createdAt: 0 } as Menu} />
              </div>
           </div>
        </div>

        <AnimatePresence>
          {uiState.editingItemId && editingItem && (
            <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center lg:p-10">
               <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => updateUiState({ editingItemId: null })} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
               
               <MotionDiv 
                 layoutId="item-modal" 
                 className="relative w-full max-w-6xl bg-[#f8fafc] rounded-t-[2rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95dvh] lg:max-h-[90dvh] overflow-hidden border border-white/50"
               >
                  {/* Header Bar */}
                  <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Editácia položky</span>
                           <h2 className="text-2xl font-serif font-bold text-slate-900 line-clamp-1">{editingItem.label || 'Bez názvu'}</h2>
                        </div>
                        
                        {/* Type Toggle */}
                        <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 ml-4">
                           <button 
                             onClick={() => updateItem(editingItem.id, { type: 'dish' })}
                             className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${editingItem.type !== 'section' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                             Jedlo
                           </button>
                           <button 
                             onClick={() => updateItem(editingItem.id, { type: 'section' })}
                             className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${editingItem.type === 'section' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                             Sekcia
                           </button>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                         <Button variant="ghost" onClick={() => updateUiState({ editingItemId: null })}>
                           <X className="w-6 h-6" />
                         </Button>
                     </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 scrollbar-hide">
                     
                     {/* General Info Section */}
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-8">
                           
                           {/* Name & Icon Input Group */}
                           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                              <div className="flex gap-4">
                                 {/* Icon Trigger */}
                                 <div className="relative">
                                    <button 
                                      onClick={() => setIconPickerOpen(!iconPickerOpen)}
                                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-200 transition-colors ${editingItem.icon ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}
                                    >
                                       {SelectedIcon ? <SelectedIcon className="w-8 h-8" /> : <Settings className="w-8 h-8" />}
                                    </button>
                                    <Suspense fallback={null}>
                                       <IconPicker 
                                          isOpen={iconPickerOpen} 
                                          onClose={() => setIconPickerOpen(false)} 
                                          onSelect={icon => updateItem(editingItem.id, { icon })}
                                          selectedIcon={editingItem.icon}
                                          placement="bottom"
                                       />
                                    </Suspense>
                                 </div>

                                 {/* Label Input */}
                                 <div className="flex-1 relative group">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest absolute -top-2.5 left-4 bg-white px-2">Názov {editingItem.type === 'section' ? 'Sekcie' : 'Jedla'}</label>
                                    <input 
                                      value={editingItem.label} 
                                      onChange={e => updateItem(editingItem.id, { label: e.target.value })} 
                                      className="w-full h-16 bg-transparent px-4 text-xl font-bold text-slate-900 outline-none border-b-2 border-slate-100 focus:border-indigo-500 transition-colors placeholder:text-slate-200"
                                      placeholder={editingItem.type === 'section' ? "Napr. Predjedlá" : "Napr. Sviečková na smotane"}
                                    />
                                    {/* Translation Button */}
                                    <button 
                                       onClick={() => handleAutoTranslate(editingItem)} 
                                       disabled={uiState.isTranslating}
                                       className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                       title="AI Preklad"
                                    >
                                       <Languages className={`w-5 h-5 ${uiState.isTranslating ? 'animate-pulse text-indigo-500' : ''}`} />
                                    </button>
                                 </div>
                              </div>

                              {/* Description - Common for both */}
                              <div className="relative">
                                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 block">Popis {editingItem.type === 'section' ? '(Voliteľné)' : ''}</label>
                                  <textarea 
                                    value={editingItem.description || ''} 
                                    onChange={e => updateItem(editingItem.id, { description: e.target.value })} 
                                    className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[120px] resize-y text-slate-600 leading-relaxed" 
                                    placeholder={editingItem.type === 'section' ? "Krátky popis sekcie..." : "Detailný popis zloženia a chutí..."}
                                  />
                              </div>
                           </div>

                           {/* DISH SPECIFIC FIELDS */}
                           {editingItem.type !== 'section' && (
                             <>
                                {/* Allergens & Dietary */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                   <div>
                                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 block flex items-center gap-2">
                                        <Leaf className="w-3 h-3" /> Diétne značky
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                         {DIETARY_OPTIONS.map(tag => (
                                           <button 
                                            key={tag} 
                                            onClick={() => {
                                              const next = (editingItem.dietaryTags || []).includes(tag) ? (editingItem.dietaryTags || []).filter(t => t !== tag) : [...(editingItem.dietaryTags || []), tag];
                                              updateItem(editingItem.id, { dietaryTags: next });
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${editingItem.dietaryTags?.includes(tag) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                           >
                                             {tag}
                                           </button>
                                         ))}
                                      </div>
                                   </div>
                                   
                                   <div className="h-px bg-slate-100" />

                                   <div>
                                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 block flex items-center gap-2">
                                        <Utensils className="w-3 h-3" /> Alergény
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                         {ALLERGENS.map(num => (
                                           <button 
                                            key={num} 
                                            onClick={() => {
                                              const next = (editingItem.allergens || []).includes(num) ? (editingItem.allergens || []).filter(n => n !== num) : [...(editingItem.allergens || []), num];
                                              updateItem(editingItem.id, { allergens: next });
                                            }}
                                            className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${editingItem.allergens?.includes(num) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                           >
                                             {num}
                                           </button>
                                         ))}
                                      </div>
                                   </div>
                                </div>

                                {/* Scheduling Section */}
                                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 shadow-inner space-y-5">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Dostupnosť & Časovanie</h3>
                                      </div>
                                      <button 
                                        onClick={() => handleAiSchedule(editingItem)}
                                        disabled={uiState.isGeneratingSchedule}
                                        className="text-[9px] font-bold uppercase text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
                                      >
                                        {uiState.isGeneratingSchedule ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        AI Návrh
                                      </button>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                         <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Typ jedla</label>
                                         <div className="flex flex-wrap gap-2">
                                            {['all', 'breakfast', 'lunch', 'dinner'].map((type: any) => (
                                              <button
                                                key={type}
                                                onClick={() => updateItem(editingItem.id, { availability: { ...(editingItem.availability || { days: [0,1,2,3,4,5,6] }), type } })}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${editingItem.availability?.type === type || (!editingItem.availability && type === 'all') ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                                              >
                                                {type === 'all' ? 'Všetko' : type}
                                              </button>
                                            ))}
                                         </div>
                                      </div>
                                      <div className="space-y-3">
                                         <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Časové okno</label>
                                         <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                               <input 
                                                 type="time" 
                                                 value={editingItem.availability?.timeStart || ''} 
                                                 onChange={e => updateItem(editingItem.id, { availability: { ...(editingItem.availability || { type: 'all', days: [0,1,2,3,4,5,6] }), timeStart: e.target.value } })}
                                                 className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                               />
                                            </div>
                                            <span className="text-slate-300">-</span>
                                            <div className="relative flex-1">
                                               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                               <input 
                                                 type="time" 
                                                 value={editingItem.availability?.timeEnd || ''} 
                                                 onChange={e => updateItem(editingItem.id, { availability: { ...(editingItem.availability || { type: 'all', days: [0,1,2,3,4,5,6] }), timeEnd: e.target.value } })}
                                                 className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                               />
                                            </div>
                                         </div>
                                      </div>
                                   </div>

                                   <div className="space-y-3">
                                      <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Dni v týždni</label>
                                      <div className="flex gap-2">
                                         {DAYS.map((day, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => {
                                                const currentDays = editingItem.availability?.days || [0,1,2,3,4,5,6];
                                                const newDays = currentDays.includes(idx) 
                                                  ? currentDays.filter(d => d !== idx)
                                                  : [...currentDays, idx];
                                                updateItem(editingItem.id, { availability: { ...(editingItem.availability || { type: 'all' }), days: newDays } });
                                              }}
                                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${editingItem.availability?.days?.includes(idx) || (!editingItem.availability && true) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                            >
                                              {day}
                                            </button>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             </>
                           )}
                        </div>

                        {/* Right Column (Visuals & Extras) */}
                        <div className="lg:col-span-4 space-y-8">
                            {editingItem.type !== 'section' ? (
                               <>
                                  {/* Price & URL Card */}
                                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Cena</label>
                                         <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                              value={editingItem.price || ''} 
                                              onChange={e => updateItem(editingItem.id, { price: e.target.value })} 
                                              className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                              placeholder="0.00"
                                            />
                                         </div>
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">URL (Voliteľné)</label>
                                         <div className="relative">
                                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                              value={editingItem.url || ''} 
                                              onChange={e => updateItem(editingItem.id, { url: e.target.value })} 
                                              className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                              placeholder="#detail"
                                            />
                                         </div>
                                      </div>
                                  </div>

                                  {/* Image Card */}
                                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                      <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Fotografia</label>
                                          <button 
                                            onClick={() => handleAiPhotoGenerate(editingItem)}
                                            disabled={uiState.isGeneratingImage}
                                            className="text-[9px] font-bold uppercase text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                          >
                                            <Camera className="w-3 h-3" /> AI Foto
                                          </button>
                                      </div>
                                      <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group/img">
                                         {uiState.isGeneratingImage ? (
                                            <div className="flex flex-col items-center gap-3">
                                               <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                               <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600">Generuje sa vizuál...</span>
                                            </div>
                                         ) : editingItem.image ? (
                                           <>
                                             <img 
                                                src={editingItem.image} 
                                                className="w-full h-full object-cover" 
                                                alt="Item" 
                                                crossOrigin="anonymous"
                                                onError={(e) => (e.currentTarget.style.display = 'none')} 
                                              />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <label className="bg-white text-slate-950 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-xl">Vymeniť<input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleItemImageUpload(editingItem.id, e.target.files[0])}/></label>
                                                <button onClick={() => updateItem(editingItem.id, { image: undefined })} className="bg-rose-500 text-white p-2 rounded-xl shadow-xl hover:bg-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                             </div>
                                           </>
                                         ) : (
                                           <div className="flex flex-col items-center gap-3 text-slate-300">
                                              <ImageIcon className="w-8 h-8" />
                                              <label className="text-[10px] font-bold uppercase text-indigo-600 cursor-pointer hover:underline"><input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleItemImageUpload(editingItem.id, e.target.files[0])}/>Pridať fotografiu</label>
                                           </div>
                                         )}
                                      </div>
                                  </div>

                                  {/* Wine Pairing */}
                                  <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
                                      <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest flex items-center gap-2"><Wine className="w-3 h-3" /> Párovanie</label>
                                          <button onClick={() => handleWinePairing(editingItem)} disabled={uiState.isGeneratingWine} className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-600 hover:scale-105 transition-transform"><Sparkles className={`w-4 h-4 ${uiState.isGeneratingWine ? 'animate-spin' : ''}`} /></button>
                                      </div>
                                      <textarea 
                                        value={editingItem.pairing || ''}
                                        onChange={e => updateItem(editingItem.id, { pairing: e.target.value })}
                                        className="w-full bg-white/50 border border-indigo-100/50 rounded-xl p-3 text-sm italic text-indigo-900 outline-none resize-none h-24 placeholder:text-indigo-300"
                                        placeholder="Odporúčanie someliéra..."
                                      />
                                  </div>
                               </>
                            ) : (
                               // Section specifics
                               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center text-slate-400 text-sm">
                                  <TypeIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                  <p>Sekcie slúžia na organizáciu menu. Neobsahujú cenu ani alergény.</p>
                               </div>
                            )}
                        </div>
                     </div>
                     
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 bg-white border-t border-slate-200 flex justify-end gap-4 shrink-0">
                     <Button variant="primary" size="lg" onClick={() => updateUiState({ editingItemId: null })} className="rounded-xl px-12 bg-slate-900 text-white">
                        Uložiť Zmeny
                     </Button>
                  </div>

               </MotionDiv>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};
