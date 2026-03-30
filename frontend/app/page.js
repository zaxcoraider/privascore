import Navbar from "../components/navbar";
import Hero from "../components/hero";
import PrivaScorePanel from "../components/privascore-panel";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-hero text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-10 pt-6 sm:px-8 lg:px-10">
        <Navbar />
        <Hero />
        <section id="app-panel" className="pb-12">
          <PrivaScorePanel />
        </section>
        <footer className="border-t border-white/8 pt-6 text-center text-sm text-slate-400">
          Built with Fhenix
        </footer>
      </div>
    </main>
  );
}

