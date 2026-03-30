"use client";

export default function Navbar() {
  return (
    <header className="mb-12 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="glass-border relative flex h-12 items-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 shadow-glow backdrop-blur-xl">
          <img
            src="/privascore-logo.svg"
            alt="PrivaScore"
            className="h-6 w-auto sm:h-7"
          />
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
