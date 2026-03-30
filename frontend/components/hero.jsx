export default function Hero() {
  return (
    <section className="relative mb-14 grid gap-10 overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] px-6 py-10 shadow-panel backdrop-blur-sm sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,140,255,0.18),transparent_26%),radial-gradient(circle_at_80%_30%,rgba(157,123,255,0.14),transparent_24%)]" />
      <div className="relative">
        <div className="mb-5 inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-sky-200">
          Confidential Lending Infrastructure
        </div>
        <h2 className="max-w-3xl text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
          Private Credit Scoring for On-Chain Lending
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Check eligibility without exposing your data. PrivaScore keeps sensitive credit data encrypted while lenders get the decision they need.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#app-panel"
            className="rounded-full bg-gradient-to-r from-accent to-accentSoft px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:scale-[1.02]"
          >
            Get Started
          </a>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            Zero-knowledge style UX for modern DeFi underwriting
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        <div className="glass-border relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 shadow-glow backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Encrypted Output</p>
              <p className="mt-1 text-sm text-slate-300">Lender receives eligibility only</p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              Secure
            </div>
          </div>
          <div className="animate-float space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Wallet Profile</span>
                <span className="font-mono text-slate-400">0xF0B2...Bc1D</span>
              </div>
              <div className="score-mask rounded-2xl border border-accent/20 bg-accent/10 px-4 py-5 font-mono text-center text-lg tracking-[0.6em] text-accent">
                ******
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Eligibility Decision</div>
              <div className="flex items-center justify-between rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-4">
                <div>
                  <p className="text-lg font-medium text-white">Eligible</p>
                  <p className="mt-1 text-sm text-slate-300">Threshold matched without revealing score</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_24px_rgba(62,224,137,0.55)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

