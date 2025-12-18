
import React from 'react';
import { 
  Plus, Edit2, Layout, Calendar, Users, CreditCard, 
  Lock, ArrowUpCircle, Database, Activity, Sparkles, Trash2, Layers
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, PlanTier } from '../types';
import { Button } from './ui/Button';
import { PLAN_CONFIG, getNextTier } from '../utils/gastroPlans';

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
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  menus, onCreate, onEdit, onDelete, currentPlan, onUpgrade, onRestoreDemo 
}) => {
  
  const planDetails = PLAN_CONFIG[currentPlan];
  const nextPlanKey = getNextTier(currentPlan);
  const nextPlan = nextPlanKey ? PLAN_CONFIG[nextPlanKey] : null;

  return (
    <div className="min-h-dvh bg-slate-50 font-sans selection:bg-indigo-100 pb-32 overflow-y-auto scrollbar-hide pt-safe">
      
      {/* Floating Glass Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 md:px-8 py-4"
      >
        <div className="max-w-7xl mx-auto glass-effect rounded-[2rem] p-4 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/40 transform -rotate-3 hover:rotate-0 transition-transform">
               <span className="font-serif font-bold text-xl">L</span>
             </div>
             <div className="flex flex-col">
                <span className="font-serif font-bold text-slate-900 tracking-tight leading-none text-base md:text-lg">Luxe Menu Builder</span>
                <div className="flex items-center gap-2 mt-1">
                   <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-indigo-600 text-white shadow-sm">
                     {planDetails.label}
                   </span>
                   <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 hidden sm:inline">OS v3.2</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            {nextPlan && (
              <Button size="sm" variant="gradient" onClick={onUpgrade} className="hidden sm:flex rounded-xl h-10 px-4">
                <ArrowUpCircle className="w-4 h-4 mr-2" /> Upgrade
              </Button>
            )}
             <Button size="icon" onClick={onCreate} variant="primary" className="rounded-2xl h-12 w-12 shadow-xl shadow-indigo-500/30">
               <Plus className="w-6 h-6" />
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-4 tracking-tighter">
            Vitajte v <span className="italic font-light opacity-60">Ateliéri.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-xl max-w-xl leading-relaxed">
            Spravujte svoje vizuálne menu s eleganciou a rýchlosťou AI.
          </p>
        </motion.div>

        {/* Dynamic Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          
          {/* Main Menus List */}
          <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2">
            <div className="h-full bg-white rounded-[3rem] p-2 border border-slate-200 shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Layout className="w-64 h-64 rotate-12" />
              </div>
              
              <div className="p-8 md:p-10 flex-1 relative z-10 flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col">
                      <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Vytvorené Menu</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Stav: Aktívne</p>
                   </div>
                   <Button onClick={onCreate} variant="ghost" className="rounded-2xl hover:bg-slate-50 text-indigo-600 font-bold">
                     <Plus className="w-4 h-4 mr-2" /> Nové
                   </Button>
                 </div>
                 
                 <div className="space-y-4">
                   <AnimatePresence mode="popLayout">
                    {menus.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center gap-6">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                             {/* Fixed: Added missing Layers icon from lucide-react */}
                             <Layers className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className="text-slate-400 text-sm font-medium">Zatiaľ ste nevytvorili žiadne menu.</p>
                          {onRestoreDemo && (
                            <Button variant="secondary" size="sm" onClick={onRestoreDemo} className="rounded-xl px-6 h-10 border-slate-200">
                               <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> Ukážkové dáta
                            </Button>
                          )}
                      </motion.div>
                    ) : (
                      menus.map(menu => (
                        <motion.div 
                            key={menu.id} 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -4, shadow: "0 20px 40px -20px rgba(0,0,0,0.1)" }}
                            className="flex items-center justify-between p-5 rounded-[1.75rem] bg-white border border-slate-100 hover:border-indigo-300 cursor-pointer transition-all group/item shadow-sm"
                          >
                            <div className="flex items-center gap-5 flex-1 min-w-0" onClick={() => onEdit(menu.id)}>
                               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                 <Layout className="w-5 h-5" />
                               </div>
                               <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-slate-800 text-base truncate">{menu.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">{new Date(menu.createdAt).toLocaleDateString()} • {menu.theme}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEdit(menu.id); }}
                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(menu.id); }}
                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                        </motion.div>
                      ))
                    )}
                   </AnimatePresence>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Module Cards */}
          <ModuleCard title="Rezervácie" icon={Calendar} description="Systém stolov" plan={currentPlan} requiredPlan="business" onUpgrade={onUpgrade} stats="8 aktívnych" color="bg-emerald-50 text-emerald-600" />
          <ModuleCard title="Analytics" icon={Activity} description="Traffic & Sales" plan={currentPlan} requiredPlan="corporate" onUpgrade={onUpgrade} stats="14.2k návštev" color="bg-orange-50 text-orange-600" />
          <ModuleCard title="Payments" icon={CreditCard} description="Direct Stripe" plan={currentPlan} requiredPlan="enterprise" onUpgrade={onUpgrade} stats="0.00 €" color="bg-blue-50 text-blue-600" />
          <ModuleCard title="Cloud Asset" icon={Database} description="High-res storage" plan={currentPlan} requiredPlan="business" onUpgrade={onUpgrade} stats="420 MB" color="bg-pink-50 text-pink-600" />

        </motion.div>
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{
  title: string;
  icon: any;
  description: string;
  plan: PlanTier;
  requiredPlan: PlanTier;
  onUpgrade: () => void;
  stats: string;
  color: string;
}> = ({ title, icon: Icon, description, plan, requiredPlan, onUpgrade, stats, color }) => {
  const isLocked = !PLAN_CONFIG[plan].modules[title.toLowerCase() as any] && title.toLowerCase() !== 'analytics' && title.toLowerCase() !== 'cloud asset';
  
  // Custom logic for demonstration locking
  const effectivelyLocked = isLocked || (requiredPlan === 'corporate' && plan === 'basic') || (requiredPlan === 'enterprise' && plan !== 'enterprise');

  return (
    <motion.div 
      variants={itemVariants}
      className="relative bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-[220px]"
    >
      {effectivelyLocked && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
          <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center mb-4 shadow-2xl">
            <Lock className="w-6 h-6" />
          </motion.div>
          <h4 className="font-serif font-bold text-slate-900 text-sm mb-1">Premium Modul</h4>
          <button onClick={onUpgrade} className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:underline">Odomknúť v {PLAN_CONFIG[requiredPlan].label}</button>
        </div>
      )}

      <div>
        <div className={`p-4 rounded-2xl w-fit mb-6 ${color} transform group-hover:rotate-6 transition-transform`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{description}</p>
      </div>
      
      <div className="pt-6 mt-4 border-t border-slate-50 flex items-center justify-between">
         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Live Data</span>
         <span className="font-mono text-xs font-bold text-slate-600">{effectivelyLocked ? '--' : stats}</span>
      </div>
    </motion.div>
  );
};
