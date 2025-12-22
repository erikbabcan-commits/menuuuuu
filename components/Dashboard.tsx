
import React, { useState } from 'react';
import { 
  Plus, Edit2, Layout, Calendar, Users, CreditCard, 
  Lock, ArrowUpCircle, Database, Activity, Sparkles, Trash2, Layers, TrendingUp,
  QrCode, Share2, Download, BarChart3, Globe, ExternalLink, Smartphone, MousePointer2, X
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, PlanTier } from '../types';
import { Button } from './ui/Button';
import { PLAN_CONFIG, getNextTier } from '../utils/gastroPlans';
import { accentColors } from '../utils/themeStyles';

interface DashboardProps {
  menus: Menu[];
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  currentPlan: PlanTier;
  onUpgrade: () => void;
  onRestoreDemo?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  menus, onCreate, onEdit, onDelete, currentPlan, onUpgrade 
}) => {
  const [activeMenuForQr, setActiveMenuForQr] = useState<string | null>(null);
  const planDetails = PLAN_CONFIG[currentPlan];

  return (
    <div className="h-full bg-slate-50 font-sans selection:bg-indigo-100 overflow-y-auto pt-safe pb-32 scrollbar-hide">
      
      {/* SaaS Premium Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 md:px-8 py-4"
      >
        <div className="max-w-7xl mx-auto glass-effect rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl shadow-slate-900/5">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-slate-950 rounded-[1.2rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
               <span className="font-serif font-bold text-2xl relative z-10">L</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div>
                <h2 className="font-serif font-bold text-slate-900 text-xl tracking-tight leading-none mb-2">Ateliér CMS</h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Business Cloud • Aktívny
                   </span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aktuálny Plán</span>
                <span className="text-sm font-bold text-indigo-600">{planDetails.label}</span>
             </div>
             <Button size="icon" onClick={onCreate} variant="primary" className="rounded-2xl h-14 w-14 shadow-indigo-500/20 shadow-xl">
               <Plus className="w-7 h-7" />
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 space-y-16">
        
        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 p-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between min-h-[240px]">
             <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Mesačná návštevnosť</h3>
                   <div className="text-4xl font-serif font-bold text-slate-900">14.8k <span className="text-emerald-500 text-sm align-top font-sans">+12%</span></div>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity className="w-5 h-5" /></div>
             </div>
             <div className="h-24 w-full flex items-end gap-1.5 pt-4">
                {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85, 60, 95].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                    className="flex-1 bg-slate-900/5 rounded-t-lg group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 rounded-t-lg transition-all duration-300" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                       Vist: {h * 12}
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device Breakdown</h4>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <div className="flex justify-between text-xs font-bold"><span className="text-slate-600">Mobile</span><span className="text-slate-900">82%</span></div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-indigo-500" /></div>
                </div>
                <div className="space-y-1">
                   <div className="flex justify-between text-xs font-bold"><span className="text-slate-600">Desktop</span><span className="text-slate-900">18%</span></div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '18%' }} transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }} className="h-full bg-slate-300" /></div>
                </div>
             </div>
          </div>

          <div className="p-8 bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-500/20 text-white flex flex-col justify-between overflow-hidden relative group">
             <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <TrendingUp className="w-32 h-32" />
             </div>
             <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">SaaS Revenue Boost</h4>
             <div className="space-y-2 relative z-10">
                <div className="text-3xl font-serif font-bold">€49.99 <span className="text-xs font-sans opacity-60">/ mo</span></div>
                <p className="text-[10px] leading-relaxed opacity-80">You are currently saving 14 hours per month via LMB Automation.</p>
             </div>
             <Button variant="secondary" size="sm" className="w-full rounded-2xl h-11 text-indigo-600 relative z-10" onClick={onUpgrade}>
                Spravovať Predplatné
             </Button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="space-y-8 pb-20">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Kolekcia Dizajnov</h3>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Layers className="w-5 h-5" /></button>
                 <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><BarChart3 className="w-5 h-5" /></button>
              </div>
           </div>

           <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {menus.map(menu => (
                <motion.div 
                  key={menu.id} 
                  variants={itemVariants}
                  className="group bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-5 h-5 text-slate-300" />
                   </div>

                   <div className={`w-full md:w-48 h-48 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100 shadow-inner`}>
                      {menu.heroImageUrl ? (
                        <img src={menu.heroImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Preview" />
                      ) : (
                        <QrCode className="w-12 h-12 text-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button variant="secondary" size="sm" className="rounded-xl h-10 px-4" onClick={() => onEdit(menu.id)}>
                           Edit Architect
                        </Button>
                      </div>
                   </div>

                   <div className="flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-serif font-bold text-slate-900">{menu.name}</h4>
                            <span className={`w-3 h-3 rounded-full ${accentColors[menu.accentColor].bg}`} />
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            {menu.theme.toUpperCase()} • {menu.items.length} ITEMS • {menu.activeLanguages.join(', ')}
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <Button variant="secondary" size="sm" className="rounded-2xl h-12" onClick={() => setActiveMenuForQr(menu.id)}>
                            <QrCode className="w-4 h-4 mr-2" /> QR Export
                         </Button>
                         <Button variant="secondary" size="sm" className="rounded-2xl h-12">
                            <Share2 className="w-4 h-4 mr-2" /> Live Link
                         </Button>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                         <div className="flex -space-x-2">
                            {['1', '2', '3'].map((u) => (
                              <img key={u} src={`https://i.pravatar.cc/100?u=${u}${menu.id}`} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="Staff" />
                            ))}
                         </div>
                         <button onClick={() => onDelete(menu.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-2 rounded-xl hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                </motion.div>
              ))}

              <button 
                onClick={onCreate}
                className="group border-2 border-dashed border-slate-200 rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-slate-400 hover:text-indigo-600"
              >
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-indigo-500/10 transition-all">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-serif text-lg font-bold">Navrhnúť Nové Menu</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Creative Cloud AI</p>
                </div>
              </button>
           </motion.div>
        </div>
      </div>

      {/* Stylized QR Code Modal */}
      <AnimatePresence>
         {activeMenuForQr && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveMenuForQr(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-[4rem] p-12 max-w-sm w-full text-center space-y-10 shadow-2xl">
                 <button onClick={() => setActiveMenuForQr(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5 text-slate-300" /></button>
                 
                 <div className="space-y-3">
                    <h3 className="font-serif text-3xl font-bold tracking-tight">Kulinársky Most</h3>
                    <p className="text-sm text-slate-400 font-light px-4">Digitálne prepojenie medzi vaším hosťom a touto kartou.</p>
                 </div>

                 <div className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100 flex items-center justify-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-52 h-52 bg-white p-6 rounded-[2.5rem] shadow-2xl relative z-10">
                       <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 opacity-80">
                          <rect x="10" y="10" width="20" height="20" fill="currentColor" rx="4" />
                          <rect x="70" y="10" width="20" height="20" fill="currentColor" rx="4" />
                          <rect x="10" y="70" width="20" height="20" fill="currentColor" rx="4" />
                          <path d="M40 10h20v10H40zm0 20h10v10H40zm20 0h10v10H60zm10 10h10v10H70zm-30 10h10v10H40zm20 0h10v10H60zm10 10h10v10H70zm-50 10h10v10H20zm20 0h10v10H40zm20 0h10v10H60z" fill="currentColor" />
                          <circle cx="50" cy="50" r="12" fill="white" />
                          <circle cx="50" cy="50" r="8" className="text-indigo-600" fill="currentColor" />
                       </svg>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4">
                    <Button variant="primary" className="w-full h-14 rounded-2xl shadow-xl shadow-slate-900/10" onClick={() => setActiveMenuForQr(null)}>
                       <Download className="w-5 h-5 mr-2" /> Exportovať 4K PNG
                    </Button>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Pripravené pre tlač na plexisklo</p>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
