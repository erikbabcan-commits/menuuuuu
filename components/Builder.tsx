import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { ArrowLeft, GripVertical, Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, Save, Monitor, Smartphone, Palette, Globe, Edit2, X, Smile } from 'lucide-react';
import { Menu, MenuItem, MenuTheme, AiGeneratedItem } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateMenuStructure } from '../services/geminiService';
import { IconPicker } from './IconPicker';
import { iconMap } from '../utils/icons';

interface BuilderProps {
  menuId: string | null;
  onBack: () => void;
  onSave: (menu: Menu) => void;
  initialData?: Menu;
}

export const Builder: React.FC<BuilderProps> = ({ menuId, onBack, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || 'My Luxury Menu');
  const [theme, setTheme] = useState<MenuTheme>(initialData?.theme || 'glass');
  const [items, setItems] = useState<MenuItem[]>(initialData?.items || []);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // New Item State
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('#');
  const [newItemIcon, setNewItemIcon] = useState('');
  const [isAddIconPickerOpen, setIsAddIconPickerOpen] = useState(false);

  // Edit Item State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditIconPickerOpen, setIsEditIconPickerOpen] = useState(false);

  const handleAddItem = () => {
    if (!newItemLabel) return;
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: newItemLabel,
      url: newItemUrl,
      depth: 0,
      icon: newItemIcon || undefined
    };
    setItems([...items, newItem]);
    setNewItemLabel('');
    setNewItemUrl('#');
    setNewItemIcon('');
    setIsAddIconPickerOpen(false);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
    setEditingItem(null);
    setIsEditIconPickerOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleIndent = (index: number, direction: 'in' | 'out') => {
    const newItems = [...items];
    const item = newItems[index];
    const prevItem = newItems[index - 1];

    if (direction === 'in') {
      if (prevItem && prevItem.depth < 1) { // Max depth 1 for this builder
        item.depth = 1;
      }
    } else {
      item.depth = 0;
    }
    setItems(newItems);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateMenuStructure(aiPrompt);
      
      const newItems: MenuItem[] = [];
      const processItem = (item: AiGeneratedItem, depth: number) => {
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          label: item.label,
          url: item.url,
          depth
        });
        if (item.children) {
          item.children.forEach(child => processItem(child, depth + 1));
        }
      };

      generated.forEach(item => processItem(item, 0));
      
      // Filter out too deep items if any
      const validItems = newItems.filter(i => i.depth <= 1);
      setItems(prev => [...prev, ...validItems]);
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (err) {
      alert('Failed to generate menu. Please check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const menu: Menu = {
      id: menuId || Date.now().toString(),
      name,
      theme,
      items,
      createdAt: initialData?.createdAt || Date.now()
    };
    onSave(menu);
  };

  const NewItemIconComp = newItemIcon && iconMap[newItemIcon] ? iconMap[newItemIcon] : Smile;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar / Editor */}
      <div className="w-full md:w-[480px] bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl z-20 shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Menu Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full font-serif font-bold text-xl text-slate-900 border-none focus:ring-0 p-0 placeholder-slate-300 bg-transparent"
              placeholder="e.g. Main Navigation"
            />
          </div>
          <Button size="sm" onClick={handleSave} className="flex gap-2 items-center shadow-lg shadow-slate-900/10">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-40">
          
          {/* Theme Selector */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Palette className="w-3 h-3" /> Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['glass', 'light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`
                    group relative px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-300 overflow-hidden
                    ${theme === t 
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]' 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300'}
                  `}
                >
                  <span className="relative z-10">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 shadow-sm group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-16 h-16 text-indigo-900 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-indigo-950 font-serif font-bold text-lg flex items-center gap-2">
                  AI Architect
                </h3>
              </div>
              <p className="text-sm text-indigo-700/80 mb-4 leading-relaxed">
                Describe your brand, and our AI will generate a perfectly structured navigation tree instantly.
              </p>
              <Button size="sm" onClick={() => setIsAiModalOpen(true)} className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" /> Launch Generator
              </Button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Structure
              </label>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{items.length} links</span>
            </div>
            
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
              {items.map((item, index) => {
                const ItemIcon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
                return (
                  <Reorder.Item key={item.id} value={item} className="relative">
                    <div 
                      className={`
                        group flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300
                        ${item.depth > 0 ? 'ml-6 border-l-4 border-l-slate-300 bg-slate-50/50' : ''}
                      `}
                    >
                      <div className="p-1 rounded cursor-move hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors">
                         <GripVertical className="w-4 h-4" />
                      </div>

                      {ItemIcon && (
                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-500">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm truncate tracking-tight">{item.label}</div>
                        <div className="text-xs text-slate-400 truncate font-mono mt-0.5">{item.url}</div>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2 shadow-[-10px_0_10px_rgba(255,255,255,0.8)]">
                         <button 
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleIndent(index, 'out')}
                          disabled={item.depth === 0}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-20 transition-colors"
                          title="Outdent"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleIndent(index, 'in')}
                          disabled={item.depth === 1 || index === 0 || items[index - 1].depth === 1}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-20 transition-colors"
                          title="Indent"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors ml-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {items.length === 0 && (
              <div className="text-center py-10 px-4 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p>Your menu is empty.</p>
                <p className="mt-1 text-xs opacity-70">Add items manually or use the AI generator.</p>
              </div>
            )}
          </div>

          {/* Add Item Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3 sticky bottom-0 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-10">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Add Link</h4>
             </div>
            <div className="flex gap-2">
               <div className="relative">
                  <button 
                    onClick={() => setIsAddIconPickerOpen(!isAddIconPickerOpen)}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-colors ${newItemIcon ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    title="Select Icon"
                  >
                     <NewItemIconComp className="w-5 h-5" />
                  </button>
                  <IconPicker 
                    isOpen={isAddIconPickerOpen} 
                    onClose={() => setIsAddIconPickerOpen(false)}
                    selectedIcon={newItemIcon}
                    onSelect={setNewItemIcon}
                    placement="top"
                  />
               </div>
              <input
                type="text"
                placeholder="Label"
                className="flex-[2] text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors bg-white"
                value={newItemLabel}
                onChange={e => setNewItemLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              />
              <input
                type="text"
                placeholder="URL"
                className="flex-[1] text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors bg-white font-mono text-xs"
                value={newItemUrl}
                onChange={e => setNewItemUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              />
              <Button size="sm" onClick={handleAddItem} disabled={!newItemLabel} className="h-10 w-10 !px-0 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-100 relative flex flex-col min-h-[500px]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md rounded-full px-1.5 py-1.5 flex gap-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/20 z-30">
          <button 
            onClick={() => setViewMode('desktop')}
            className={`p-2.5 rounded-full transition-all duration-300 ${viewMode === 'desktop' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            className={`p-2.5 rounded-full transition-all duration-300 ${viewMode === 'mobile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Device Frame */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden relative z-10">
          <div 
            className={`
              transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3)] overflow-hidden relative border-slate-900/5
              ${viewMode === 'mobile' 
                ? 'w-[375px] h-[750px] rounded-[3.5rem] border-[12px] border-slate-900 ring-4 ring-slate-900/10' 
                : 'w-[95%] h-[90%] rounded-2xl border border-slate-200/50'}
            `}
          >
             {/* Notch for mobile */}
             {viewMode === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-[60]" />}
             
             <div className={`w-full h-full overflow-hidden ${viewMode === 'mobile' ? 'rounded-[2.5rem]' : ''}`}>
               <MenuPreview menu={{ id: 'preview', name, theme, items, createdAt: 0 }} />
             </div>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="font-serif text-2xl font-bold text-slate-900">AI Menu Architect</h3>
                 <p className="text-slate-500 text-sm mt-1">Generate a structured sitemap in seconds.</p>
              </div>
            </div>
            
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
            <textarea
              className="w-full h-32 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base mb-6 bg-slate-50/50"
              placeholder="e.g. A modern real estate agency focusing on luxury penthouses in New York..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAiGenerate} isLoading={isGenerating} disabled={!aiPrompt} className="px-8 shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="w-4 h-4 mr-2" /> Generate Structure
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-serif text-xl font-bold text-slate-900">Edit Link</h3>
               <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Icon</label>
                  <div className="relative inline-block">
                    <button 
                      onClick={() => setIsEditIconPickerOpen(!isEditIconPickerOpen)}
                      className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      {editingItem.icon && iconMap[editingItem.icon] 
                        ? React.createElement(iconMap[editingItem.icon], { className: "w-6 h-6" }) 
                        : <Smile className="w-6 h-6 text-slate-300" />}
                    </button>
                    <IconPicker 
                      isOpen={isEditIconPickerOpen} 
                      onClose={() => setIsEditIconPickerOpen(false)}
                      selectedIcon={editingItem.icon}
                      onSelect={(icon) => setEditingItem({...editingItem, icon})}
                      placement="bottom"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Label</label>
                   <input 
                      value={editingItem.label}
                      onChange={e => setEditingItem({...editingItem, label: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">URL</label>
                   <input 
                      value={editingItem.url}
                      onChange={e => setEditingItem({...editingItem, url: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-mono text-sm"
                   />
                </div>
             </div>

             <div className="flex justify-end gap-3 mt-8">
               <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
               <Button onClick={handleUpdateItem} className="px-6 bg-slate-900 text-white">Save Changes</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};