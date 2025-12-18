import React, { useState } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, GripVertical, Plus, Trash2, ChevronRight, ChevronLeft, 
  Sparkles, Save, Palette, Layers, Eye, Eraser, TrendingUp, Smile, Edit2, Zap, Coffee, Utensils, Wine
} from 'lucide-react';
import { Menu, MenuItem, MenuTheme, AiGeneratedItem, PlanTier } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateMenuStructure } from '../services/geminiService';
import { generateLocalMenu } from '../services/localGenerator';
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

const QUICK_TEMPLATES = [
  { id: 'fine', label: 'Fine Dining', icon: Wine, prompt: 'luxusná reštaurácia fine dining' },
  { id: 'cafe', label: 'Kaviareň', icon: Coffee, prompt: 'moderná kaviareň' },
  { id: 'bistro', label: 'Modern Bistro', icon: Utensils, prompt: 'trendy bistro' },
];

export const Builder: React.FC<BuilderProps> = ({ 
  menuId, onBack, onSave, initialData 
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [items, setItems] = useState<MenuItem[]>(initialData?.items || []);
  const [name, setName] = useState(initialData?.name || 'Nové Menu');
  const [theme, setTheme] = useState<MenuTheme>(initialData?.theme || 'glass');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);

  const processGeneratedData = (data: AiGeneratedItem[]) => {
    const newItems: MenuItem[] = [];
    const processNode = (node: AiGeneratedItem, depth: number) => {
      newItems.push({ id: crypto.randomUUID(), label: node.label, url: node.url || '#', depth });
      if (node.children) node.children.forEach(child => processNode(child, depth + 1));
    };
    data.forEach(root => processNode(root, 0));
    setItems(newItems);
  };

  const handleGenerate = async (p?: string) => {
    const targetPrompt = p || prompt;
    if (!targetPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateMenuStructure(targetPrompt);
      processGeneratedData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setActiveTab('preview');
    }
  };

  const handleQuickTemplate = (p: string) => {
    const data = generateLocalMenu(p);
    processGeneratedData(data);
    setActiveTab('preview');
  };

  const updateItem = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <div className="h-dvh w-full flex flex-col bg-slate-50 overflow-hidden pt-safe">
      {/* Top Navigation Bar */}
      <div className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-serif font-bold text-base md:text-xl text-slate-900 bg-transparent outline-none focus:ring-0 w-full max-w-[180px] md:max-w-xs"
            placeholder="Názov menu"
          />
        </div>
        
        <div className="flex items-center gap-2">
           <Button 
             variant="primary" 
             size="sm"
             onClick={() => onSave({ id: menuId || crypto.randomUUID(), name, items, theme, createdAt: Date.now() })}
             className="md:h-10 rounded-xl"
           >
             <Save className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Uložiť</span>
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Editor Pane */}
        <div className={`
          flex-1 h-full overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50 transition-all duration-300
          ${activeTab === 'preview' ? 'hidden md:block md:w-1/3 opacity-50 grayscale-[0.5]' : 'block md:w-2/5 lg:w-1/3'}
          border-r border-slate-200 scrollbar-hide
        `}>
          
          {/* Templates Section */}
          <section className="space-y-4">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" /> Okamžité Šablóny
             </label>
             <div className="grid grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => handleQuickTemplate(t.prompt)}
                    className="p-4 bg-white border border-slate-200 rounded-[1.5rem] hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col items-center gap-3 group active:scale-95"
                  >
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <t.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600 group-hover:text-indigo-900 text-center">{t.label}</span>
                  </button>
                ))}
             </div>
          </section>

          {/* AI Box */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-32 h-32" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                 <Sparkles className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">AI Generátor</span>
               </div>
               <h3 className="text-2xl font-serif font-bold mb-6 leading-tight">Navrhnite menu pár slovami</h3>
               <div className="flex flex-col gap-3">
                 <input 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md placeholder:text-white/30"
                   placeholder="napr. Luxusný Steakhouse v New Yorku..."
                   onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                 />
                 <Button variant="gradient" onClick={() => handleGenerate()} isLoading={isGenerating} className="w-full h-14 text-base rounded-2xl">
                   Vytvoriť Architektúru
                 </Button>
               </div>
             </div>
          </div>

          {/* Items Structure */}
          <section className="space-y-4 pb-32">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Štruktúra
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setItems([...items, { id: crypto.randomUUID(), label: 'Nová položka', url: '#', depth: 0 }])}>
                    <Plus className="w-4 h-4 mr-1" /> Pridať
                  </Button>
                </div>
             </div>
             
             <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
                    const isPickerOpen = iconPickerOpen === item.id;
                    return (
                      <Reorder.Item key={item.id} value={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                         <div className={`bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm transition-all relative ${isPickerOpen ? 'z-50 ring-2 ring-indigo-500' : 'hover:shadow-md'}`}>
                            <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing" />
                            <div className="relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setIconPickerOpen(isPickerOpen ? null : item.id); }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.icon ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                {Icon ? <Icon className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
                              </button>
                              <IconPicker 
                                isOpen={isPickerOpen} 
                                onClose={() => setIconPickerOpen(null)} 
                                onSelect={(icon) => updateItem(item.id, { icon })}
                                selectedIcon={item.icon}
                                placement="bottom"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                               <input 
                                value={item.label}
                                onChange={(e) => updateItem(item.id, { label: e.target.value })}
                                className="w-full text-sm font-bold outline-none bg-transparent text-slate-900 truncate"
                                placeholder="Položka menu"
                              />
                              <input 
                                value={item.url}
                                onChange={(e) => updateItem(item.id, { url: e.target.value })}
                                className="w-full text-[10px] font-mono text-slate-400 outline-none bg-transparent truncate"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="flex gap-1 shrink-0">
                               <button onClick={() => updateItem(item.id, { depth: 0 })} className={`p-2 rounded-xl transition-all ${item.depth === 0 ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'text-slate-300 hover:text-slate-500'}`}><ChevronLeft className="w-4 h-4" /></button>
                               <button onClick={() => updateItem(item.id, { depth: 1 })} className={`p-2 rounded-xl transition-all ${item.depth === 1 ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'text-slate-300 hover:text-slate-500'}`}><ChevronRight className="w-4 h-4" /></button>
                            </div>
                            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </Reorder.Item>
                    );
                  })}
                </AnimatePresence>
             </Reorder.Group>
          </section>
        </div>

        {/* Preview Pane */}
        <div className={`
          flex-1 h-full bg-slate-100 transition-all duration-500 relative
          ${activeTab === 'editor' ? 'hidden md:block md:w-2/3 lg:w-3/4' : 'block md:w-2/3 lg:w-3/4'}
        `}>
           {/* Theme Quick Switcher Overlay */}
           <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl border border-white/50 flex gap-4">
              {['glass', 'dark', 'light'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTheme(t as MenuTheme)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${theme === t ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
           </div>
           <div className="h-full w-full overflow-hidden">
             <MenuPreview menu={{ id: 'preview', name, items, theme, createdAt: 0 }} />
           </div>
        </div>

        {/* Mobile Tab Switcher - Floating Action Group */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex bg-slate-900/95 backdrop-blur-2xl p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:hidden z-50 border border-white/10 pb-safe">
           <button 
             onClick={() => setActiveTab('editor')} 
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400'}`}
           >
             <Edit2 className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-widest">Editor</span>
           </button>
           <button 
             onClick={() => setActiveTab('preview')} 
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400'}`}
           >
             <Eye className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-widest">Náhľad</span>
           </button>
        </div>
      </div>
    </div>
  );
};