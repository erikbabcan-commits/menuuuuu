import React from 'react';
import { 
  Plus, Edit2, Layout, Calendar, Users, CreditCard, 
  Lock, ArrowUpCircle, Database, Activity, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  menus, onCreate, onEdit, currentPlan, onUpgrade, onRestoreDemo 
}) => {
  
  const planDetails = PLAN_CONFIG[currentPlan];
  const nextPlanKey = getNextTier(currentPlan);
  const nextPlan = nextPlanKey ? PLAN_CONFIG[nextPlanKey] : null;

  // Mock Resource Usage
  const storageUsed = currentPlan === 'basic' ? 0 : 450; 
  const storageLimit = planDetails.limits.storage;
  const storagePercent = storageLimit === 'unlimited' || storageLimit === 0 ? 0 : (storageUsed / storageLimit) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 pb-20">
      
      {/* Floating Glass Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 md:px-6 pt-4 pb-2"
      >
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-3 md:p-4 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
               <span className="font-serif font-bold text-lg">G</span>
             </div>
             <div className="flex flex-col">
                <span className="font-serif font-bold text-slate-900 tracking-tight leading-none text-sm md:text-base">Gastro OS</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                   Pracovná plocha
                </span>
             </div>
             <span className="hidden sm:inline-flex ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
               Balík {planDetails.label}
             </span>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Stats (Desktop) */}
            {storageLimit !== 0 && (
              <div className="hidden md:flex flex-col gap-1 w-32">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                    <span>Úložisko</span>
                    <span>{storageLimit === 'unlimited' ? '∞' : `${Math.round(storagePercent)}%`}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${storageLimit === 'unlimited' ? 10 : storagePercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full" 
                    />
                 </div>
              </div>
            )}
            
            {nextPlan && (
              <Button size="sm" variant="gradient" onClick={onUpgrade} className="hidden md:flex">
                <ArrowUpCircle className="w-4 h-4" /> Inovovať
              </Button>
            )}
            
            {/* Mobile Plus Button */}
             <Button size="icon" onClick={onCreate} className="md:hidden rounded-xl">
               <Plus className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10 pl-2"
        >
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-2">
            Dobré ráno.
          </h1>
          <p className="text-slate-500 text-sm md:text-lg max-w-2xl leading-relaxed">
            Váš digitálny ekosystém je aktívny. 
            {nextPlan && <span className="text-indigo-600 font-medium cursor-pointer hover:underline" onClick={onUpgrade}> Odomknúť AI funkcie</span>}
          </p>
        </motion.div>

        {/* Animated Modules Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          
          {/* 1. Menus Module (Primary) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
            <div className="h-full bg-white rounded-[2rem] p-1 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                 <Layout className="w-64 h-64 rotate-12" />
              </div>
              
              <div className="p-6 md:p-8 flex-1 relative z-10 flex flex-col">
                 <div className="flex items-center justify-between mb-6">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                     <Layout className="w-6 h-6" />
                   </div>
                   <Button onClick={onCreate} className="rounded-xl shadow-lg shadow-indigo-500/20">
                     <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Nové Menu</span>
                   </Button>
                 </div>
                 
                 <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-2">Digitálne Menu</h3>
                 <p className="text-slate-500 text-sm mb-6 max-w-sm">Spravujte ponuku vašej reštaurácie pomocou AI architekta. Potiahni a pusti.</p>
                 
                 <div className="space-y-3 mt-auto">
                   {menus.length === 0 ? (
                     <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-4">
                        <p className="text-slate-400 text-sm">Zatiaľ žiadne menu.</p>
                        {onRestoreDemo && (
                          <Button variant="ghost" size="sm" onClick={onRestoreDemo} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
                             <Sparkles className="w-4 h-4 mr-2" /> Obnoviť ukážkové dáta
                          </Button>
                        )}
                     </div>
                   ) : (
                     menus.slice(0, 3).map(menu => (
                       <motion.div 
                          key={menu.id} 
                          whileHover={{ scale: 1.01, x: 4 }}
                          onClick={() => onEdit(menu.id)} 
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white cursor-pointer transition-all group/item"
                        >
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-indigo-500" />
                             <span className="font-bold text-slate-700 truncate max-w-[120px] sm:max-w-xs">{menu.name}</span>
                          </div>
                          <div className="p-2 bg-white rounded-full text-slate-300 group-hover/item:text-indigo-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </div>
                       </motion.div>
                     ))
                   )}
                 </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Reservations Module */}
          <ModuleCard 
            title="Rezervácie" 
            moduleKey="reservations"
            icon={Calendar} 
            description="Správa stolov."
            plan={currentPlan}
            requiredPlan="business"
            onUpgrade={onUpgrade}
            stats="12 dnes"
            color="bg-emerald-50 text-emerald-600"
          />

          {/* 3. CRM Module */}
          <ModuleCard 
            title="Zákazníci" 
            moduleKey="customers"
            icon={Users} 
            description="Vernostné dáta."
            plan={currentPlan}
            requiredPlan="corporate"
            onUpgrade={onUpgrade}
            stats="1,402 aktívnych"
            color="bg-blue-50 text-blue-600"
          />

          {/* 4. Payments Module */}
          <ModuleCard 
            title="Platby" 
            moduleKey="payments"
            icon={CreditCard} 
            description="Stripe Connect."
            plan={currentPlan}
            requiredPlan="enterprise"
            onUpgrade={onUpgrade}
            stats="12 400 €"
            color="bg-purple-50 text-purple-600"
          />

          {/* 5. Analytics (Traffic) */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
             <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                   <Activity className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Analytika</div>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm opacity-60">Mesačná návštevnosť</h4>
               <div className="text-3xl font-serif font-bold text-slate-900 mt-1 tracking-tight">
                 {planDetails.limits.traffic === 'limited' ? '2.4k' : '154k'}
               </div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                 <div className="bg-orange-400 h-full w-[65%]" />
               </div>
             </div>
          </motion.div>
          
           {/* 6. Storage Module */}
           <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
             <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                   <Database className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Cloud</div>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm opacity-60">Využité zdroje</h4>
               <div className="text-3xl font-serif font-bold text-slate-900 mt-1 tracking-tight">
                 {storageLimit === 0 ? '0MB' : (storageLimit === 'unlimited' ? '45GB' : `${storageUsed}MB`)}
               </div>
               <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                 {storageLimit === 0 ? <Lock className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                 {storageLimit === 0 ? 'Inovujte pre nahrávanie' : 'Hi-res podklady'}
               </div>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{
  title: string;
  moduleKey: keyof typeof PLAN_CONFIG['basic']['modules'];
  icon: any;
  description: string;
  plan: PlanTier;
  requiredPlan: PlanTier;
  onUpgrade: () => void;
  stats: string;
  color: string;
}> = ({ title, moduleKey, icon: Icon, description, plan, requiredPlan, onUpgrade, stats, color }) => {
  const isLocked = !PLAN_CONFIG[plan].modules[moduleKey];
  const reqPlanLabel = PLAN_CONFIG[requiredPlan].label;

  return (
    <motion.div 
      variants={itemVariants}
      className={`relative bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px]`}
    >
      
      {isLocked && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-3 shadow-xl"
          >
            <Lock className="w-5 h-5" />
          </motion.div>
          <h4 className="font-bold text-slate-900 mb-1">Zamknuté</h4>
          <p className="text-xs text-slate-500 mb-4">Dostupné v balíku {reqPlanLabel}</p>
          <Button size="sm" onClick={onUpgrade} variant="secondary" className="w-full justify-center rounded-xl">
            Inovovať
          </Button>
        </div>
      )}

      <div>
        <div className="flex items-start justify-between mb-6">
          <div className={`p-3 rounded-2xl ${isLocked ? 'bg-slate-100 text-slate-400' : color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-1 leading-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
      </div>
      
      <div className="pt-6 mt-4 border-t border-slate-50">
        <div className="flex items-center justify-between text-sm">
           <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Stav</span>
           <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{isLocked ? '---' : stats}</span>
        </div>
      </div>
    </motion.div>
  );
};