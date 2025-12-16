import React, { useState, useRef, useEffect } from 'react';
import { iconMap, iconCategories } from '../utils/icons';
import { Search, X, Smile } from 'lucide-react';

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
  const pickerRef = useRef<HTMLDivElement>(null);

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
        className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 aspect-square ${isSelected ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
        title={name}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  const renderContent = () => {
    // 1. Search Mode
    if (searchTerm) {
      const filtered = Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filtered.length === 0) {
        return (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Smile className="w-6 h-6 opacity-20" />
            Ikony nenájdené
          </div>
        );
      }

      return (
        <div className="grid grid-cols-6 gap-1 p-2">
          {filtered.map(name => renderIconBtn(name))}
        </div>
      );
    }

    // 2. Category Mode
    return (
      <div className="space-y-4 p-2 pb-4">
        {/* Special 'No Icon' option at top */}
        <div className="flex items-center gap-2 px-1">
             <button
               onClick={() => { onSelect(''); onClose(); }}
               className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 transition-colors`}
             >
               <X className="w-3 h-3" />
               Odstrániť ikonu
             </button>
        </div>

        {Object.entries(iconCategories).map(([category, icons]) => {
           // Ensure icons exist in map
           const validIcons = icons.filter(name => iconMap[name]);
           if (validIcons.length === 0) return null;

           return (
             <div key={category}>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
                 <span className="h-px flex-1 bg-slate-100"></span>
                 {category}
                 <span className="h-px flex-1 bg-slate-100"></span>
               </div>
               <div className="grid grid-cols-6 gap-1">
                 {validIcons.map(name => renderIconBtn(name))}
               </div>
             </div>
           );
        })}
      </div>
    );
  };

  return (
    <div 
      ref={pickerRef}
      className={`absolute left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[400px] ${placementClasses}`}
    >
      {/* Search Header */}
      <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700"
          placeholder="Hľadať ikony..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus
        />
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto scrollbar-hide flex-1 bg-white">
        {renderContent()}
      </div>
    </div>
  );
};