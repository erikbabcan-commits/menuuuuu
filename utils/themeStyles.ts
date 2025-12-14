export const themeStyles = {
  glass: {
    background: "bg-slate-50",
    nav: "bg-white/60 backdrop-blur-md border-b border-white/40 text-slate-900 shadow-sm supports-[backdrop-filter]:bg-white/40",
    dropdown: "bg-white/80 backdrop-blur-xl border border-white/50 text-slate-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    mobileMenu: "bg-white/95 backdrop-blur-2xl text-slate-900",
    heroText: "text-slate-800"
  },
  dark: {
    background: "bg-slate-950",
    nav: "bg-black/40 backdrop-blur-xl text-white border-b border-white/5 shadow-2xl supports-[backdrop-filter]:bg-black/20",
    dropdown: "bg-slate-900/90 backdrop-blur-xl border border-white/10 text-slate-100 shadow-2xl shadow-black/50",
    mobileMenu: "bg-slate-950/95 backdrop-blur-2xl text-white",
    heroText: "text-white"
  },
  light: {
    background: "bg-white",
    nav: "bg-white/95 backdrop-blur-sm text-slate-900 border-b border-slate-100 shadow-sm",
    dropdown: "bg-white border border-slate-100 text-slate-900 shadow-xl shadow-slate-200/50",
    mobileMenu: "bg-white text-slate-900",
    heroText: "text-slate-900"
  }
};

export type ThemeType = keyof typeof themeStyles;