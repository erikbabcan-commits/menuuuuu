import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Key } from 'lucide-react';
import { motion } from 'framer-motion';

interface DevLockScreenProps {
  onUnlock: () => void;
  onGuest: () => void;
}

export const DevLockScreen: React.FC<DevLockScreenProps> = ({ onUnlock, onGuest }) => {
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Poklop2025#') {
      onUnlock();
    } else {
      setIsError(true);
      setPassword('');
      // Reset error state after animation to allow re-triggering
      setTimeout(() => setIsError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 font-sans text-slate-200">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Vývojársky prístup</h1>
          <p className="text-slate-400 text-sm">
            Zadajte bezpečnostný kľúč na odomknutie funkcií Enterprise a systémových nastavení.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Key className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsError(false);
              }}
              className={`w-full bg-slate-900/50 border ${isError ? 'border-red-500/50 text-red-200 placeholder-red-300/30' : 'border-white/10 text-white placeholder-slate-600'} rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              placeholder="Zadajte prístupový kód"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4" /> Odomknúť systém
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-500">Vyhradená oblasť. Len pre autorizovaný personál.</p>
          <button 
            onClick={onGuest}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
          >
            Pokračovať ako hosť <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};