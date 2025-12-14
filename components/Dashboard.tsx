import React from 'react';
import { Plus, Edit2, Trash2, Calendar, Layout } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Luxury Menus</h1>
            <p className="text-slate-500">Manage your premium navigation structures.</p>
          </div>
          <Button size="lg" onClick={onCreate} className="shadow-lg shadow-slate-900/20">
            <Plus className="w-5 h-5 mr-2" /> Create New Menu
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <div 
              key={menu.id} 
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <Layout className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="flex gap-1">
                   <button 
                    onClick={() => onEdit(menu.id)}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(menu.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">{menu.name}</h3>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                   {menu.items.length} Items
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(menu.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {/* Empty State Card */}
          <button 
            onClick={onCreate}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium">Create Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
