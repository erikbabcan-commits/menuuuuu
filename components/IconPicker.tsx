import React, { useState, useRef, useEffect, useMemo } from 'react';
import { iconMap, iconCategories } from '../utils/icons';
import { Search, X, Smile, Filter } from 'lucide-react';

interface IconPickerProps {
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
  isOpen: boolean;
  onClose: () => void;
  placement?: 'top' | 'bottom';
}

export const IconPicker: React.FC<IconPickerProps> = ({ 
  selectedIcon, 
  onSelect, 
  isOpen, 
  onClose,
  placement = 'top' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Reset vyhľadávania pri zatvorení
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setActiveCategory(null);
    }
  }, [isOpen]);

  // Kliknutie mimo komponentu ho zatvorí
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

  // Efektívne filtrovanie ikon pomocou useMemo
  const filteredIcons = useMemo(() => {
    let result: string[] = [];

    if (activeCategory) {
      // Filtrovanie podľa vybranej kategórie
      result = iconCategories[activeCategory] || [];
    } else {
      // Ak nie je kategória, prehľadávame všetky
      result = Object.keys(iconMap);
    }

    // Aplikácia textového vyhľadávania
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(name => 
        name.toLowerCase().includes(term)
      );
    }

    return result;
  }, [searchTerm, activeCategory]);

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
        className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 aspect-square ${isSelected ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
        title={name}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div 
      ref={pickerRef}
      className={`absolute left-0 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[450px] ${placementClasses}`}
    >
      {/* Search Header */}
      <div className="p-3 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 space-y-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700"
            placeholder="Hľadať ikony..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Kategórie / Filtre */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${!activeCategory ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}
          >
            Všetky
          </button>
          {Object.keys(iconCategories).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Info Bar */}
      <div className="px-4 py-2 bg-white border-b border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          {searchTerm || activeCategory ? (
            <>
              <Filter className="w-3 h-3" />
              Nájdené: {filteredIcons.length}
            </>
          ) : (
            'Prehľadávať knižnicu'
          )}
        </span>
        <button 
          onClick={() => { onSelect(''); onClose(); }} 
          className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-700"
        >
          Odstrániť
        </button>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto p-3 bg-white scrollbar-hide flex-1 min-h-[150px]">
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-6 gap-1.5">
            {filteredIcons.map(name => renderIconBtn(name))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
              <Smile className="w-6 h-6 opacity-20" />
            </div>
            <p className="font-medium">Nenašli sme žiadne zodpovedajúce ikony</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory(null); }}
              className="text-indigo-600 font-bold hover:underline"
            >
              Resetovať filtre
            </button>
          </div>
        )}
      </div>
      
      {/* Footer / Tip */}
      <div className="p-3 bg-slate-50 text-[9px] text-slate-400 text-center font-medium border-t border-slate-100">
        Kliknite na ikonu pre výber
      </div>
    </div>
  );
};
