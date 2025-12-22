
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Robustný Error Boundary s presným typovaním pre state a props.
 * Zachytáva neočakávané chyby pri renderovaní a poskytuje luxusný fallback.
 */
// Fix: Use React.Component and property initialization to resolve "Property 'state' does not exist" errors
export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Application Error Caught:", error, errorInfo);
  }

  render() {
    /**
     * Fix: Accessing state and props correctly from the base class.
     */
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-4 tracking-tight">Niečo sa pokazilo</h1>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Vyskytla sa neočakávaná systémová chyba. Naša ochrana integrity zachytila problém, aby sme predišli strate dát.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-mono text-left text-slate-400 mb-8 overflow-x-auto max-h-32">
              {error?.message || "Neznáma systémová chyba v jadre aplikácie."}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" /> Reštartovať Systém
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
