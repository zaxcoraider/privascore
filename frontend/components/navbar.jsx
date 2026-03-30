"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWalletUi } from "./app-providers";

function formatAddress(address) {
  return address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";
}

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openWalletModal } = useWalletUi();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCopyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    setMenuOpen(false);
  }

  function handleDisconnect() {
    disconnect();
    setMenuOpen(false);
  }

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

      <div className="relative" ref={menuRef}>
        {isConnected ? (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="rounded-full border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-accent/40 hover:bg-white/10"
            >
              {formatAddress(address)}
            </button>

            <div
              className={`absolute right-0 top-[calc(100%+0.75rem)] z-20 w-52 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-panel backdrop-blur-xl transition duration-150 ${
                menuOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.05]"
              >
                <span>Copy address</span>
                <span className="text-xs text-slate-500">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-rose-300 transition hover:bg-white/[0.05]"
              >
                <span>Disconnect</span>
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={openWalletModal}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-accent/40 hover:bg-white/10"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
