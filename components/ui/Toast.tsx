import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />
  };

  const colors = {
    success: 'border-emerald-100 bg-white/90',
    error: 'border-rose-100 bg-white/90',
    info: 'border-indigo-100 bg-white/90'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', transition: { duration: 0.2 } }}
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] min-w-[300px] max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 ${colors[type]}`}
        >
          <div className="shrink-0">{icons[type]}</div>
          <p className="flex-1 text-sm font-medium text-slate-700">{message}</p>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};