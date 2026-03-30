"use client";

export default function Navbar() {
  return (
    <header className="mb-12 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="glass-border relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 shadow-glow backdrop-blur-xl">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-accent via-sky-300 to-accentSoft" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Private FHE</p>
          <h1 className="text-xl font-medium tracking-tight text-white">PrivaScore</h1>
        </div>
      </div>
      <a
        href="#app-panel"
        className="rounded-full border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-accent/40 hover:bg-white/10"
      >
        Connect Wallet
      </a>
    </header>
  );
}

