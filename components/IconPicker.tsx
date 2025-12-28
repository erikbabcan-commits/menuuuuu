
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { iconMap, iconCategories } from '../utils/icons';
import { Search, X, Smile, Filter } from 'lucide-react';

interface IconPickerProps {
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
  isOpen: boolean;
  onClose: () => void;
  placement?: 'top' | 'bottom';
}

/**
 * Optimized IconPicker component with Lazy Loading (Infinite Scroll).
 * Only renders icons as they come into the viewport to improve performance.
 */
export const IconPicker: React.FC<IconPickerProps> = ({ 
  selectedIcon, 
  onSelect, 
  isOpen, 
  onClose,
  placement = 'top' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(48); // Initial batch size (approx 8 rows)
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset search and visible limit on close or open
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setActiveCategory(null);
    } else {
      // Reset limit when opening to ensure clean state
      setVisibleLimit(48);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  // Reset visible limit when filter changes
  useEffect(() => {
    setVisibleLimit(48);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [searchTerm, activeCategory]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Efficient icon filtering
  const filteredIcons = useMemo(() => {
    let result: string[] = [];

    if (activeCategory) {
      result = iconCategories[activeCategory] || [];
    } else {
      result = Object.keys(iconMap);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(name => 
        name.toLowerCase().includes(term)
      );
    }

    return result;
  }, [searchTerm, activeCategory]);

  // Infinite Scroll Handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Load more when scrolled near the bottom (100px threshold)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setVisibleLimit(prev => {
        // Only update if we have more icons to show
        if (prev >= filteredIcons.length) return prev;
        return Math.min(prev + 48, filteredIcons.length);
      });
    }
  }, [filteredIcons.length]);

  if (!isOpen) return null;

  const placementClasses = placement === 'top' 
    ? 'bottom-full mb-2 origin-bottom-left' 
    : 'top-full mt-2 origin-top-left';

  const renderIconBtn = (name: string) => {
    const Icon = iconMap[name];
    if (!Icon) return null;
    
    const isSelected = selectedIcon === name;
    return (
      <button
        key={name}
        onClick={() => { onSelect(name); onClose(); }}
        className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 aspect-square ${isSelected ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200 shadow-inner' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
        title={name}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div 
      ref={pickerRef}
      className={`absolute left-0 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-300 z-[60] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[450px] ${placementClasses}`}
    >
      {/* Search Header */}
      <div className="p-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-300 sticky top-0 z-10 space-y-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-300 shadow-inner focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-900 font-medium"
            placeholder="Vyhľadať symbol..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${!activeCategory ? 'bg-slate-950 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}
          >
            Všetky
          </button>
          {Object.keys(iconCategories).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Info Bar */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          {searchTerm || activeCategory ? (
            <>
              <Filter className="w-3 h-3" />
              Nájdené: {filteredIcons.length}
            </>
          ) : (
            'Prehľadávať Ateliér Ikon'
          )}
        </span>
        <button 
          onClick={() => { onSelect(''); onClose(); }} 
          className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-all"
        >
          Odstrániť
        </button>
      </div>

      {/* Content Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto p-4 bg-white scrollbar-hide flex-1 min-h-[200px]"
      >
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.slice(0, visibleLimit).map(name => renderIconBtn(name))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-inner">
              <Smile className="w-8 h-8 opacity-10" />
            </div>
            <p className="font-bold uppercase tracking-widest opacity-60">Symbol nebol nájdený</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory(null); }}
              className="text-indigo-600 font-bold hover:underline bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100"
            >
              Resetovať filtre
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-slate-50 text-[10px] text-slate-500 text-center font-bold border-t border-slate-300 uppercase tracking-widest">
        Knižnica Luxury Studio
      </div>
    </div>
  );
};
