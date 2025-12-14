import React from 'react';
import { Plus, Edit2, Trash2, Calendar, Layout, ArrowRight } from 'lucide-react';
import { Menu } from '../types';
import { Button } from './ui/Button';

interface DashboardProps {
  menus: Menu[];
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ menus, onCreate, onEdit, onDelete }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
              Luxury Menus
            </h1>
            <p className="text-lg text-slate-500 font-light max-w-lg leading-relaxed">
              Design, organize, and deploy premium navigation structures with an AI-assisted architect.
            </p>
          </div>
          <Button size="lg" onClick={onCreate} className="shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20">
            <Plus className="w-5 h-5 mr-2" /> Create New Menu
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menus.map((menu) => (
            <div 
              key={menu.id} 
              className="group bg-white rounded-2xl p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-slate-200 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[280px]"
            >
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
                    <Layout className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(menu.id); }}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(menu.id); }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-2xl text-slate-900 mb-2 truncate">{menu.name}</h3>
                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {menu.items.length} Items
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(menu.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button 
                  onClick={() => onEdit(menu.id)}
                  className="w-full flex items-center justify-between text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors group/btn"
                >
                  Configure Menu
                  <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State Card */}
          <button 
            onClick={onCreate}
            className="h-[280px] border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-300 group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <span className="font-serif font-medium text-xl">Create New Menu</span>
            <span className="text-sm mt-2 opacity-70">Start from scratch or use AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};