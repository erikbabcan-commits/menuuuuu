import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../utils/icons';
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

  const filteredIcons = Object.keys(iconMap).filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placementClasses = placement === 'top' 
    ? 'bottom-full mb-2 origin-bottom-left' 
    : 'top-full mt-2 origin-top-left';

  return (
    <div 
      ref={pickerRef}
      className={`absolute left-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-200 ${placementClasses}`}
    >
      <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700"
          placeholder="Hľadať ikony..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus
        />
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-2 grid grid-cols-6 gap-1 max-h-60 overflow-y-auto scrollbar-hide bg-white">
        <button
           onClick={() => { onSelect(''); onClose(); }}
           className={`p-2 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100 text-slate-400`}
           title="Bez ikony"
        >
          <X className="w-5 h-5" />
        </button>
        {filteredIcons.map(name => {
          const Icon = iconMap[name];
          const isSelected = selectedIcon === name;
          return (
            <button
              key={name}
              onClick={() => { onSelect(name); onClose(); }}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'hover:bg-slate-100 text-slate-600'}`}
              title={name}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-6 py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Smile className="w-6 h-6 opacity-20" />
            Ikony nenájdené
          </div>
        )}
      </div>
    </div>
  );
};