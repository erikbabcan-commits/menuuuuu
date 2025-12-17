import React, { useState } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, GripVertical, Plus, Trash2, ChevronRight, ChevronLeft, 
  Sparkles, Save, Palette, Layers, Eye, Eraser, TrendingUp, Smile, Edit2
} from 'lucide-react';
import { Menu, MenuItem, MenuTheme, AiGeneratedItem, PlanTier } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateMenuStructure, optimizeMenuStructure } from '../services/geminiService';
import { IconPicker } from './IconPicker';
import { iconMap } from '../utils/icons';

interface BuilderProps {
  menuId: string | null;
  onBack: () => void;
  onSave: (menu: Menu) => void;
  initialData?: Menu;
  currentPlan: PlanTier;
  onUpgrade: () => void;
}

const THEMES: { id: MenuTheme; label: string; color: string }[] = [
  { id: 'glass', label: 'Sklenený efekt', color: 'bg-indigo-100' },
  { id: 'dark', label: 'Tmavý Luxus', color: 'bg-slate-900' },
  { id: 'light', label: 'Čistý Svetlý', color: 'bg-white' }
];

export const Builder: React.FC<BuilderProps> = ({ 
  menuId, onBack, onSave, initialData, currentPlan 
}) => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [items, setItems] = useState<MenuItem[]>(initialData?.items || []);
  const [name, setName] = useState(initialData?.name || 'Nové Menu');
  const [theme, setTheme] = useState<MenuTheme>(initialData?.theme || 'glass');
  
  // AI State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // UI State
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);
  
  // Demo Mode State
  const isDemo = menuId === 'demo-menu-01';
  const [showDemoGuide, setShowDemoGuide] = useState(isDemo);

  // --- Handlers ---

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      label: 'Nová položka',
      url: '#',
      depth: 0
    };
    setItems([...items, newItem]);
    setEditingItem(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Vymazať všetky položky? Toto je ideálne na začiatok "od nuly".')) {
      setItems([]);
      setShowDemoGuide(false);
    }
  };
  
  const handleResetDemo = () => {
     setItems([]);
     setName('Nové Menu');
     setTheme('glass');
     setShowDemoGuide(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Prosím, pomenujte vaše menu.');
      return;
    }
    const menu: Menu = {
      id: menuId || crypto.randomUUID(),
      name,
      items,
      theme,
      createdAt: initialData?.createdAt || Date.now()
    };
    onSave(menu);
  };

  // --- AI Handlers ---

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateMenuStructure(prompt);
      const newItems: MenuItem[] = [];
      
      const processNode = (node: AiGeneratedItem, depth: number) => {
        newItems.push({
          id: crypto.randomUUID(),
          label: node.label,
          url: node.url || '#',
          depth
        });
        if (node.children) {
          node.children.forEach(child => processNode(child, depth + 1));
        }
      };

      generated.forEach(root => processNode(root, 0));
      setItems(newItems);
      setActiveTab('preview'); 
    } catch (e) {
      alert('AI Generovanie zlyhalo. Skúste to prosím znova.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (items.length === 0) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeMenuStructure(items, 'ux');
      setItems(optimized);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // --- Render ---

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      
      {/* Top Bar - Responsive Layout */}
      <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-30 shadow-sm relative">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex flex-col min-w-0">
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-serif font-bold text-lg text-slate-900 bg-transparent outline-none placeholder:text-slate-300 w-full md:w-64 truncate focus:ring-0 p-0 border-none"
              placeholder="Názov menu"
            />
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate hidden sm:inline-block">
              {items.length} Položiek • Téma {theme}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
           {/* Desktop View Switcher */}
           <div className="hidden md:flex bg-slate-100 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Náhľad
              </button>
           </div>

           <Button 
             variant="primary" 
             onClick={handleSave} 
             className="hidden md:flex rounded-xl"
           >
             <Save className="w-4 h-4 mr-2" /> Uložiť
           </Button>

           {/* Mobile Save Icon */}
           <Button variant="primary" size="icon" onClick={handleSave} className="md:hidden rounded-xl">
             <Save className="w-5 h-5" />
           </Button>
        </div>
      </div>

      {/* Main Content Area - Split View / Tabs */}
      <div className="flex-1 overflow-hidden relative flex">
        
        {/* Editor Pane */}
        <div className={`
          flex-1 h-full overflow-y-auto bg-slate-50 transition-transform duration-300 ease-in-out 
          ${activeTab === 'editor' ? 'translate-x-0' : '-translate-x-full absolute w-full'}
          md:translate-x-0 md:relative md:w-2/5 lg:w-1/3 md:border-r border-slate-200 z-10
        `}>
          <div className="p-4 md:p-6 pb-24 md:pb-8 max-w-2xl mx-auto space-y-6 md:space-y-8">

            {/* Demo Guide Banner */}
            <AnimatePresence>
              {showDemoGuide && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-indigo-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Sparkles className="w-24 h-24 rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-serif font-bold mb-2">Sprievodca</h3>
                    <p className="text-indigo-200 text-sm mb-6 max-w-md">
                      Upravte túto ukážku alebo začnite odznova.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleResetDemo}
                        className="bg-white text-indigo-900 border-none hover:bg-indigo-50"
                      >
                        <Eraser className="w-4 h-4 mr-2" /> Vymazať
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowDemoGuide(false)}
                        className="text-indigo-200 hover:text-white hover:bg-white/10"
                      >
                        Zavrieť
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* AI Generator Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 md:p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
               <div className="absolute -top-4 -right-4 p-8 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                 <Sparkles className="w-32 h-32" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2 opacity-80">
                   <Sparkles className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase tracking-widest">AI Architekt</span>
                 </div>
                 <h2 className="text-xl md:text-2xl font-serif font-bold mb-4 leading-tight">Vygenerovať štruktúru okamžite.</h2>
                 
                 <div className="flex flex-col gap-3">
                   <input 
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder="napr. Moderný obed, Talianska večera..."
                     className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition-all"
                   />
                   <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={handleGenerate} 
                      isLoading={isGenerating}
                      className="bg-white text-indigo-900 border-none hover:bg-indigo-50 w-full justify-center"
                    >
                      Vytvoriť Menu
                    </Button>
                    {items.length > 0 && (
                      <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                        title="Optimalizovať poradie"
                      >
                        {isOptimizing ? <span className="animate-spin block">⌛</span> : <TrendingUp className="w-5 h-5" />}
                      </button>
                    )}
                   </div>
                 </div>
               </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-3 h-3" /> Vizuálna téma
              </label>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`
                      relative p-3 rounded-xl border text-left transition-all duration-200 group overflow-hidden flex flex-col items-center justify-center gap-2
                      ${theme === t.id ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full ${t.color} border border-black/5 shadow-sm`} />
                    <span className={`text-[10px] md:text-xs font-bold block ${theme === t.id ? 'text-indigo-900' : 'text-slate-600'}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-slate-50 py-2 z-10">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   <Layers className="w-3 h-3" /> Položky Menu
                </label>
                
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleClearAll}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      title="Vymazať všetko"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={handleAddItem} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Plus className="w-4 h-4 mr-1" /> Pridať položku
                  </Button>
                </div>
              </div>

              <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2 pb-20">
                {items.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <p className="text-slate-400 text-sm">Zoznam je prázdny.</p>
                  </div>
                )}

                {items.map((item) => {
                  const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
                  const isPickerOpen = iconPickerOpen === item.id;

                  return (
                    <Reorder.Item key={item.id} value={item} id={item.id}>
                       <motion.div 
                         layout
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         // IMPORTANT: removed overflow-hidden to allow IconPicker popup to show
                         className={`
                           bg-white border rounded-xl shadow-sm transition-all
                           ${editingItem === item.id || isPickerOpen ? 'border-indigo-500 ring-2 ring-indigo-100 z-20 relative' : 'border-slate-200 hover:border-slate-300 z-0'}
                         `}
                       >
                         {/* Header / Summary View */}
                         <div className="flex items-center p-3 gap-3">
                           <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing shrink-0" />
                           
                           {/* Icon Trigger */}
                           <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIconPickerOpen(isPickerOpen ? null : item.id);
                                }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.icon ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                              >
                                {Icon ? <Icon className="w-4 h-4" /> : <Smile className="w-4 h-4" />}
                              </button>
                              
                              {/* Icon Picker Component */}
                              <IconPicker 
                                isOpen={isPickerOpen} 
                                onClose={() => setIconPickerOpen(null)}
                                onSelect={(icon) => updateItem(item.id, { icon })}
                                selectedIcon={item.icon}
                              />
                           </div>

                           <div 
                             className="flex-1 cursor-pointer min-w-0" 
                             onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                           >
                             <div className="font-medium text-sm text-slate-900 truncate">{item.label}</div>
                             <div className="text-[10px] text-slate-400 font-mono truncate">{item.url}</div>
                           </div>

                           {/* Depth Controls */}
                           <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100 shrink-0">
                              <button 
                                onClick={() => updateItem(item.id, { depth: 0 })}
                                className={`p-1.5 rounded-md transition-all ${item.depth === 0 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => updateItem(item.id, { depth: 1 })}
                                className={`p-1.5 rounded-md transition-all ${item.depth === 1 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                           </div>

                           <button 
                             onClick={() => deleteItem(item.id)}
                             className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>

                         {/* Expanded Editor */}
                         <AnimatePresence>
                           {editingItem === item.id && (
                             <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 overflow-hidden rounded-b-xl"
                             >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Názov</label>
                                    <input 
                                      value={item.label}
                                      onChange={(e) => updateItem(item.id, { label: e.target.value })}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cieľová URL</label>
                                    <input 
                                      value={item.url}
                                      onChange={(e) => updateItem(item.id, { url: e.target.value })}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                  </div>
                                </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </motion.div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className={`
          absolute md:relative inset-0 w-full md:w-3/5 lg:w-2/3 h-full bg-slate-100 transition-transform duration-300 ease-in-out z-20 md:z-auto
          ${activeTab === 'preview' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
           <div className="h-full w-full overflow-hidden shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.1)] border-l border-slate-200/50">
             <MenuPreview menu={{ id: menuId || 'preview', name, items, theme, createdAt: 0 }} />
           </div>
        </div>

        {/* Mobile Floating Action Button (Tab Switcher) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50 flex gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <div className="w-px bg-white/20 my-2" />
          <button 
            onClick={() => setActiveTab('preview')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};