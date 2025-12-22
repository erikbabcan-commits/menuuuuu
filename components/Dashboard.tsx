import React, { useState } from 'react';
import { 
  Plus, Activity, TrendingUp, QrCode, Share2, Trash2, Layers, 
  BarChart3, Smartphone, X, Zap, ArrowUpRight, Layout, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, PlanTier } from '../types';
import { Button } from './ui/Button';
import { PLAN_CONFIG } from '../utils/gastroPlans';
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

const VISIT_DATA = [480, 840, 540, 1080, 780, 960, 660, 1200, 900, 1020, 720, 1140];
const MAX_VISIT = Math.max(...VISIT_DATA);

export const Dashboard: React.FC<DashboardProps> = ({ 
  menus, onCreate, onEdit, onDelete, currentPlan, onUpgrade 
}) => {
  const [activeMenuForQr, setActiveMenuForQr] = useState<string | null>(null);
  const planDetails = PLAN_CONFIG[currentPlan];

  return (
    <div className="h-full bg-[#f1f5f9] font-sans overflow-y-auto pt-safe pb-32 scrollbar-hide">
      
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-6 py-5"
      >
        <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] p-4 pl-8 flex items-center justify-between shadow-brutal border border-slate-200">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden group border border-slate-800">
               <span className="font-serif font-bold text-xl relative z-10">L</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div>
                <h2 className="font-serif font-bold text-slate-900 text-xl tracking-tight leading-none mb-1">Ateliér CMS</h2>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Predplatné</span>
                <span className="text-sm font-bold text-indigo-600">{planDetails.label}</span>
             </div>
             <Button size="icon" onClick={onCreate} variant="primary" className="rounded-2xl h-14 w-14 shadow-2xl bg-slate-900 hover:bg-black border border-slate-700">
               <Plus className="w-7 h-7 text-white" />
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 space-y-10">
        
        {/* ROW 1: ANALYTICS & REVENUE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* BOX 1: MESAČNÁ NÁVŠTEVNOSŤ */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-brutal flex flex-col justify-between min-h-[320px] relative group"
          >
             <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                   <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">Mesačná návštevnosť</h3>
                   <div className="flex items-end gap-3">
                      <span className="text-5xl font-serif font-bold text-slate-900 tracking-tighter">14.8k</span>
                      <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-xl mb-1.5 border border-emerald-200 shadow-sm">+12%</span>
                   </div>
                </div>
                <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-slate-900 shadow-brutal border border-slate-200 group-hover:scale-110 transition-transform"><Activity className="w-6 h-6" /></div>
             </div>

             <div className="h-32 w-full flex items-end gap-2.5 pt-8 relative z-10">
                {VISIT_DATA.map((v, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: `${(v / MAX_VISIT) * 100}%` }} 
                    transition={{ delay: i * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 bg-slate-200/50 rounded-t-2xl group/bar relative cursor-pointer border-t border-x border-slate-300/30"
                  >
                    <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/bar:opacity-100 rounded-t-2xl transition-all duration-300 glow-indigo" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl border border-slate-700">
                       Vist: {v}
                    </div>
                  </motion.div>
                ))}
             </div>
          </motion.div>

          {/* BOX 2: DEVICE BREAKDOWN */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-brutal flex flex-col justify-between group"
          >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner border border-amber-100"><Smartphone className="w-5 h-5" /></div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Využitie</h4>
             </div>
             
             <div className="space-y-8 py-4">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Mobile</span>
                     <span className="text-3xl font-serif font-bold text-slate-900">82%</span>
                   </div>
                   <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner-3d">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '82%' }} 
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-indigo-600 rounded-full relative glow-indigo shadow-lg"
                      >
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-white rounded-full shadow-xl border-2 border-indigo-600" />
                      </motion.div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Desktop</span>
                     <span className="text-3xl font-serif font-bold text-slate-900">18%</span>
                   </div>
                   <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner-3d">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '18%' }} 
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                        className="h-full bg-slate-400 rounded-full shadow-sm"
                      />
                   </div>
                </div>
             </div>
          </motion.div>

          {/* BOX 3: SAAS REVENUE BOOST */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="bg-slate-950 rounded-[3.5rem] p-1 border border-slate-800 shadow-brutal overflow-hidden group"
          >
             <div className="h-full w-full bg-gradient-to-br from-slate-900 to-black rounded-[3.3rem] p-10 flex flex-col justify-between relative border border-slate-800/50">
                <div className="absolute -right-6 -top-6 opacity-30 group-hover:scale-125 transition-transform duration-1000">
                   <Zap className="w-44 h-44 text-indigo-500 fill-indigo-500/10" />
                </div>
                
                <div className="space-y-2 relative z-10">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">Premium Revenue</h4>
                   <p className="text-[11px] text-white/50 leading-relaxed max-w-[140px]">Ušetrili ste <span className="text-indigo-400 font-bold">14 hodín</span> mesačne vďaka LMB automatizácii.</p>
                </div>

                <div className="space-y-5 relative z-10">
                   <div className="text-4xl font-serif font-bold text-white tracking-tight">€49.99<span className="text-xs font-sans text-white/30 ml-2">/ mo</span></div>
                   <Button variant="secondary" size="md" className="w-full rounded-2xl h-14 text-slate-900 font-bold bg-white hover:bg-slate-100 shadow-2xl border border-slate-200" onClick={onUpgrade}>
                      Upgrade Plan <ArrowUpRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
             </div>
          </motion.div>
        </div>

        {/* ROW 2: MENU COLLECTION */}
        <div className="space-y-10">
           <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Kolekcia Dizajnov</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Spravujte kulinársku identitu</p>
              </div>
              <div className="flex gap-2 p-1.5 bg-white rounded-[1.5rem] shadow-brutal border border-slate-200">
                 <button className="p-3 text-indigo-600 bg-indigo-50 rounded-xl transition-all border border-indigo-100 shadow-sm"><Layers className="w-5 h-5" /></button>
                 <button className="p-3 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100"><BarChart3 className="w-5 h-5" /></button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* BOX 4: PREVIEW CARD */}
              {menus.map(menu => (
                <motion.div 
                  key={menu.id} 
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -10, rotateX: 2 }}
                  className="bg-white rounded-[4rem] p-5 border border-slate-200 shadow-brutal hover:shadow-brutal-hover transition-all duration-500 flex flex-col md:flex-row gap-8 relative"
                  style={{ perspective: "1000px" }}
                >
                   <div className="w-full md:w-56 h-56 rounded-[3.5rem] bg-slate-100 relative overflow-hidden shadow-inner-3d border border-slate-200 group">
                      {menu.heroImageUrl ? (
                        <img src={menu.heroImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100"><Layout className="w-12 h-12 text-slate-300" /></div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button variant="secondary" size="sm" className="rounded-2xl h-11 px-6 shadow-2xl border border-white/20" onClick={() => onEdit(menu.id)}>Editovať Dizajn</Button>
                      </div>
                   </div>

                   <div className="flex-1 py-4 flex flex-col justify-between">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">{menu.name}</h4>
                            <div className={`w-4 h-4 rounded-full ${accentColors[menu.accentColor].bg} shadow-lg ring-4 ring-white border border-slate-300/20`} />
                         </div>
                         <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200 shadow-sm">{menu.theme}</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200 shadow-sm">{menu.items.length} Items</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-200 shadow-sm">{menu.activeLanguages.join(' • ')}</span>
                         </div>
                      </div>

                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                         <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="w-11 h-11 rounded-full border-2 border-white bg-slate-100 shadow-md overflow-hidden ring-1 ring-slate-200">
                                <img src={`https://i.pravatar.cc/100?u=${i}${menu.id}`} alt="Staff" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            <div className="w-11 h-11 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg ring-1 ring-slate-800">+4</div>
                         </div>
                         
                         <div className="flex gap-1.5">
                            <button onClick={() => setActiveMenuForQr(menu.id)} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-2xl transition-all" title="QR Code"><QrCode className="w-5 h-5" /></button>
                            <button className="p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-2xl transition-all" onClick={() => onDelete(menu.id)}><Trash2 className="w-5 h-5" /></button>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ))}

              {/* BOX 5: NEW MENU PORTAL */}
              <motion.button 
                onClick={onCreate}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.01 }}
                className="bg-white rounded-[4rem] p-12 flex flex-col items-center justify-center gap-8 border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all duration-500 shadow-brutal group relative overflow-hidden"
              >
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-brutal group-hover:scale-110 group-hover:shadow-indigo-500/30 transition-all border border-slate-200 relative z-10">
                   <Plus className="w-12 h-12 text-slate-900 group-hover:text-indigo-600 transition-colors" />
                   <div className="absolute inset-0 bg-indigo-500/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="text-center relative z-10 space-y-2">
                  <p className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Navrhnúť Nové Menu</p>
                  <div className="flex items-center justify-center gap-2">
                     <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                     <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400">Creative Cloud AI</p>
                  </div>
                </div>
              </motion.button>
           </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
         {activeMenuForQr && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveMenuForQr(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white rounded-[4rem] p-14 max-w-sm w-full text-center space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.6)] border border-slate-200">
                 <button onClick={() => setActiveMenuForQr(null)} className="absolute top-10 right-10 p-3 hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-200"><X className="w-7 h-7 text-slate-400" /></button>
                 
                 <div className="space-y-4">
                    <h3 className="font-serif text-3xl font-bold tracking-tight">Kulinársky Most</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Digitálna brána k menu</p>
                 </div>

                 <div className="p-12 bg-slate-50 rounded-[4rem] border border-slate-200 flex items-center justify-center shadow-inner-3d group">
                    <div className="w-56 h-56 bg-white p-8 rounded-[3rem] shadow-brutal border border-slate-100 group-hover:scale-105 transition-transform">
                       <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                          <rect x="10" y="10" width="22" height="22" fill="currentColor" rx="4" />
                          <rect x="68" y="10" width="22" height="22" fill="currentColor" rx="4" />
                          <rect x="10" y="68" width="22" height="22" fill="currentColor" rx="4" />
                          <circle cx="50" cy="50" r="10" fill="currentColor" />
                          <path d="M40 10h20v10H40zM10 40h10v20H10zM80 40h10v20H80zM40 80h20v10H40z" fill="currentColor" />
                       </svg>
                    </div>
                 </div>

                 <Button variant="primary" className="w-full h-16 rounded-2xl shadow-brutal bg-slate-900 text-lg border border-slate-700" onClick={() => setActiveMenuForQr(null)}>
                    Exportovať pre Tlač
                 </Button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};