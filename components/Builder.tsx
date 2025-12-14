import React, { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { ArrowLeft, GripVertical, Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, Save, Monitor, Smartphone, Palette, Globe } from 'lucide-react';
import { Menu, MenuItem, MenuTheme, AiGeneratedItem } from '../types';
import { Button } from './ui/Button';
import { MenuPreview } from './MenuPreview';
import { generateMenuStructure } from '../services/geminiService';

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

  const handleAddItem = () => {
    if (!newItemLabel) return;
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: newItemLabel,
      url: newItemUrl,
      depth: 0
    };
    setItems([...items, newItem]);
    setNewItemLabel('');
    setNewItemUrl('#');
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

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Editor */}
      <div className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-20">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full font-serif font-bold text-lg text-slate-900 border-none focus:ring-0 p-0 placeholder-slate-400"
              placeholder="Menu Name"
            />
          </div>
          <Button size="sm" onClick={handleSave} className="flex gap-2 items-center">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Theme Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" /> Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['glass', 'light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                    theme === t 
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg transform scale-105' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* AI Generator */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-indigo-900 font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Architect
                </h3>
                <p className="text-xs text-indigo-700 mt-1">Generate a complete structure instantly.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsAiModalOpen(true)} className="text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800">
                Open
              </Button>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Items List */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" /> Menu Items
            </label>
            
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
              {items.map((item, index) => (
                <Reorder.Item key={item.id} value={item} className="relative">
                  <div 
                    className={`
                      group flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md
                      ${item.depth > 0 ? 'ml-8 border-l-4 border-l-slate-300' : ''}
                    `}
                  >
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-move flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 text-sm truncate">{item.label}</div>
                      <div className="text-xs text-slate-400 truncate">{item.url}</div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleIndent(index, 'out')}
                        disabled={item.depth === 0}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleIndent(index, 'in')}
                        disabled={item.depth === 1 || index === 0 || items[index - 1].depth === 1}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {items.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                No items yet. Add one below or use AI.
              </div>
            )}
          </div>

          {/* Add Item Form */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <input
              type="text"
              placeholder="Label (e.g., Services)"
              className="w-full text-sm p-2 rounded border border-slate-200 focus:outline-none focus:border-slate-400"
              value={newItemLabel}
              onChange={e => setNewItemLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL (e.g., /services)"
                className="flex-1 text-sm p-2 rounded border border-slate-200 focus:outline-none focus:border-slate-400"
                value={newItemUrl}
                onChange={e => setNewItemUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              />
              <Button size="sm" onClick={handleAddItem} disabled={!newItemLabel}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-200 relative flex flex-col">
        {/* Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-4 py-2 flex gap-4 shadow-lg z-30">
          <button 
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded-full transition-colors ${viewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded-full transition-colors ${viewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Device Frame */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div 
            className={`
              transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden relative
              ${viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[3rem] border-8 border-slate-800' : 'w-full h-full rounded-xl border border-slate-300'}
            `}
          >
             {viewMode === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-[60]" />}
             
             <div className="w-full h-full overflow-hidden">
               <MenuPreview menu={{ id: 'preview', name, theme, items, createdAt: 0 }} />
             </div>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold mb-2">AI Menu Architect</h3>
            <p className="text-slate-500 text-sm mb-4">Describe the website (e.g., "A luxury sushi restaurant in Tokyo" or "A tech startup portfolio").</p>
            
            <textarea
              className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm mb-4"
              placeholder="Enter description..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAiGenerate} isLoading={isGenerating} disabled={!aiPrompt}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
