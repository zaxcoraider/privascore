"use client";

export default function Navbar() {
  return (
    <header className="mb-12 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="glass-border relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 shadow-glow backdrop-blur-xl">
          <img
            src="/privascore-icon.svg"
            alt="PrivaScore icon"
            className="h-full w-full"
          />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Private FHE</p>
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
