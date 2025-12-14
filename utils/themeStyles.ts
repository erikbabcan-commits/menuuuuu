export const themeStyles = {
  glass: {
    nav: "bg-white/70 backdrop-blur-2xl border-b border-white/20 text-slate-900 shadow-sm supports-[backdrop-filter]:bg-white/40",
    dropdown: "bg-white/80 backdrop-blur-2xl border border-white/40 text-slate-900 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]",
    mobileMenu: "bg-white/95 backdrop-blur-2xl",
    heroText: "text-slate-800"
  },
  dark: {
    nav: "bg-slate-950/95 backdrop-blur-xl text-white border-b border-white/5 shadow-2xl",
    dropdown: "bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl",
    mobileMenu: "bg-slate-950",
    heroText: "text-white"
  },
  light: {
    nav: "bg-white/95 backdrop-blur-xl text-slate-900 border-b border-slate-100 shadow-sm",
    dropdown: "bg-white border border-slate-100 text-slate-900 shadow-xl",
    mobileMenu: "bg-white",
    heroText: "text-slate-900"
  }
};

export type ThemeType = keyof typeof themeStyles;