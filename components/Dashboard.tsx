import React, { useState, useRef } from 'react';
import { 
  Plus, Activity, QrCode, Trash2, Smartphone, X, Zap, ArrowUpRight, Layout, Download, FileText, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PlanTier } from '../types';
import { Button } from './ui/Button';
import { accentColors } from '../utils/themeStyles';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface DashboardProps {
  menus: Menu[];
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  currentPlan: PlanTier;
  onUpgrade: () => void;
  onRestoreDemo?: () => void;
}

// Fix: Cast motion components to any to avoid TypeScript errors
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

const VISIT_DATA = [480, 840, 540, 1080, 780, 960, 660, 1200, 900, 1020, 720, 1140];
const MAX_VISIT = Math.max(...VISIT_DATA);

export const Dashboard: React.FC<DashboardProps> = ({ 
  menus, onCreate, onEdit, onDelete, currentPlan, onUpgrade 
}) => {
  const [activeMenuForQr, setActiveMenuForQr] = useState<Menu | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadQrCard = async () => {
    if (!cardRef.current || !activeMenuForQr) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High DPI pre tlač
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-print-card-${activeMenuForQr.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error generating QR card:", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full bg-[#edf2f7] font-sans overflow-y-auto pt-safe pb-32 scrollbar-hide">
      
      {/* Header */}
      <MotionDiv 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-6 py-5"
      >
        <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] p-4 pl-8 flex items-center justify-between shadow-brutal border border-slate-300">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden group border border-slate-800">
               <span className="font-serif font-bold text-xl relative z-10">L</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div>
                <h2 className="font-serif font-bold text-slate-900 text-xl tracking-tight leading-none mb-1">Ateliér CMS</h2>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">System Online</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <Button size="icon" onClick={onCreate} variant="primary" className="rounded-2xl h-14 w-14 shadow-2xl bg-slate-950">
               <Plus className="w-7 h-7 text-white" />
             </Button>
          </div>
        </div>
      </MotionDiv>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <MotionDiv 
            variants={itemVariants}
            initial="hidden" animate="show"
            className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-slate-300 shadow-brutal min-h-[340px] flex flex-col justify-between"
          >
             <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em]">Mesačná návštevnosť</h3>
                   <div className="flex items-end gap-3">
                      <span className="text-6xl font-serif font-bold text-slate-900 tracking-tighter">14.8k</span>
                      <span className="text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-xl mb-2">+12%</span>
                   </div>
                </div>
                <Activity className="w-8 h-8 text-slate-300" />
             </div>
             <div className="h-32 w-full flex items-end gap-2.5 pt-8">
                {VISIT_DATA.map((v, i) => (
                  <MotionDiv key={i} initial={{ height: 0 }} animate={{ height: `${(v / MAX_VISIT) * 100}%` }} className="flex-1 bg-slate-200 rounded-t-2xl relative">
                    <div className="absolute inset-0 bg-indigo-600 opacity-0 hover:opacity-100 transition-opacity rounded-t-2xl" />
                  </MotionDiv>
                ))}
             </div>
          </MotionDiv>

          <MotionDiv variants={itemVariants} initial="hidden" animate="show" className="bg-white rounded-[3.5rem] p-10 border border-slate-300 shadow-brutal flex flex-col justify-between">
             <div className="flex items-center gap-4"><Smartphone className="w-5 h-5 text-amber-500" /><h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Mobile UX</h4></div>
             <div className="space-y-8 py-4">
                <div className="space-y-3">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest"><span>Mobile</span><span>82%</span></div>
                   <div className="h-3 w-full bg-slate-100 rounded-full p-1"><div className="h-full w-[82%] bg-indigo-600 rounded-full" /></div>
                </div>
             </div>
          </MotionDiv>

          <MotionDiv variants={itemVariants} initial="hidden" animate="show" className="bg-slate-950 rounded-[3.5rem] p-1 border border-slate-800 shadow-brutal group overflow-hidden">
             <div className="h-full w-full bg-gradient-to-br from-slate-900 to-black rounded-[3.3rem] p-10 flex flex-col justify-between relative">
                <div className="absolute -right-4 -top-4 opacity-20"><Zap className="w-40 h-40 text-indigo-500" /></div>
                <p className="text-[11px] text-white/50 leading-relaxed uppercase tracking-widest relative z-10">Premium Boost</p>
                <Button variant="secondary" size="md" className="w-full rounded-2xl h-14 text-slate-950 font-bold bg-white" onClick={onUpgrade}>Upgrade Plan <ArrowUpRight className="w-5 h-5 ml-2" /></Button>
             </div>
          </MotionDiv>
        </div>

        <div className="space-y-12">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Kolekcia Ponúk</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
              {menus.map(menu => (
                <MotionDiv key={menu.id} variants={itemVariants} initial="hidden" animate="show" className="bg-white rounded-[4rem] p-6 border border-slate-300 shadow-brutal flex flex-col md:flex-row gap-8 relative group">
                   <div className="w-full md:w-56 h-56 rounded-[3.5rem] bg-slate-100 relative overflow-hidden border border-slate-200 shrink-0">
                      {menu.heroImageUrl ? <img src={menu.heroImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full flex items-center justify-center"><Layout className="w-12 h-12 text-slate-300" /></div>}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(menu.id)}>Edit Menu</Button>
                      </div>
                   </div>

                   <div className="flex-1 py-4 flex flex-col justify-between">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-serif font-bold text-slate-900">{menu.name}</h4>
                            <div className={`w-3 h-3 rounded-full ${accentColors[menu.accentColor].bg}`} />
                         </div>
                         <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">{menu.theme}</span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">{menu.items.length} položiek</span>
                         </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                         <button onClick={() => setActiveMenuForQr(menu)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all"><QrCode className="w-6 h-6" /></button>
                         <button onClick={() => onDelete(menu.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100 transition-all"><Trash2 className="w-6 h-6" /></button>
                      </div>
                   </div>
                </MotionDiv>
              ))}

              <MotionButton onClick={onCreate} variants={itemVariants} className="bg-white rounded-[4rem] p-12 flex flex-col items-center justify-center gap-8 border-2 border-dashed border-slate-300 hover:border-indigo-600 hover:bg-indigo-50/20 transition-all shadow-brutal min-h-[250px]">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-brutal border border-slate-200"><Plus className="w-10 h-10 text-slate-950" /></div>
                <div className="text-center space-y-2"><p className="font-serif text-2xl font-bold">Vytvoriť Ponuku</p><p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Creative Studio AI</p></div>
              </MotionButton>
           </div>
        </div>
      </div>

      <AnimatePresence>
         {activeMenuForQr && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveMenuForQr(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
              <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[3.5rem] p-8 max-w-sm w-full text-center space-y-8 shadow-2xl border border-slate-200 flex flex-col items-center overflow-hidden">
                 <button onClick={() => setActiveMenuForQr(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-20"><X className="w-5 h-5 text-slate-500" /></button>
                 
                 {/* Luxury Printable Card */}
                 <div ref={cardRef} className="w-full aspect-[4/5] bg-white p-10 flex flex-col items-center justify-between border-[0.5px] border-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    
                    {/* Header Logo Area */}
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center text-white mb-2 shadow-lg">
                          <Utensils className="w-5 h-5" />
                       </div>
                       <div className="h-px w-12 bg-slate-900 opacity-20" />
                    </div>

                    {/* QR Code */}
                    <div className="p-4 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-slate-50 rounded-[2.5rem] flex items-center justify-center">
                       <QRCodeCanvas 
                        value={`https://luxury-menu.builder/v/${activeMenuForQr.id}`} 
                        size={180}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "https://placehold.co/80x80/000000/ffffff?text=LMB",
                          height: 34,
                          width: 34,
                          excavate: true,
                        }}
                       />
                    </div>

                    {/* Footer Info */}
                    <div className="text-center space-y-2">
                       <h4 className="font-serif text-xl font-bold text-slate-900 tracking-tight leading-none">{activeMenuForQr.name}</h4>
                       <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.4em]">Skenujte pre digitálne menu</p>
                    </div>
                 </div>

                 <div className="w-full space-y-4 relative z-10">
                    <Button variant="primary" className="w-full h-14 rounded-2xl bg-slate-950 text-white font-bold text-sm border border-slate-800" onClick={downloadQrCard} isLoading={isExporting}>
                        <Download className="w-4 h-4 mr-2" /> Stiahnuť kartu pre tlač
                    </Button>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <FileText className="w-3 h-3" /> PNG • 300 DPI • High Quality
                    </p>
                 </div>
              </MotionDiv>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};