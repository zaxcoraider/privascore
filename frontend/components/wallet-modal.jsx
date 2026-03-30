"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnect } from "wagmi";
import { useWalletUi } from "./app-providers";
import { walletOptions } from "../lib/wallet-config";

function MetaMaskIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9" fill="none" aria-hidden="true">
      <path d="M25.6 5.8 18.3 11l1.4-3.5 5.9-1.7Z" fill="#E2761B" />
      <path d="M6.4 5.8 13.6 11l-1.3-3.5-5.9-1.7Z" fill="#E4761B" />
      <path d="m23 18.2-2 3 4.2 1.1 1.2-4-3.4-.1Z" fill="#E4761B" />
      <path d="m5.5 18.3 1.2 4 4.2-1.1-2-3-3.4.1Z" fill="#E4761B" />
      <path d="m10.7 13.1-1.2 1.9 4.4.2-.1-4.8-3.1 2.7Z" fill="#E4761B" />
      <path d="m21.3 13.1-3.2-2.7-.1 4.8 4.4-.2-1.1-1.9Z" fill="#E4761B" />
      <path d="m10.9 21.2 2.6 1.2-2.2 1.7-.4-2.9Z" fill="#E4761B" />
      <path d="m18.5 22.4 2.6-1.2-.4 2.9-2.2-1.7Z" fill="#E4761B" />
      <path d="m21.1 21.2-2.8 1.2.2-1.6-.2-1h-4.9l-.2 1 .2 1.6-2.8-1.2-.6-4 3.9.3h4.9l4-.3-.7 4Z" fill="#D7C1B3" />
      <path d="m13.7 15.4-.2 2.8-3.8-.1 4-2.7Zm4.6 0 4 2.7-3.8.1-.2-2.8Z" fill="#233447" />
      <path d="m13.6 18.2.2 2.8-2.9-.8-.4-2 3.1.1Zm4.8 0 3.1-.1-.4 2-2.9.8.2-2.8Z" fill="#CC6228" />
      <path d="m18.5 21 2.2 1.7-1.9 1.5-.4-.2-1.7-1 .1-2Zm-5-.1.1 2-1.7 1-.4.2-1.9-1.5 2.2-1.7Z" fill="#C0AD9E" />
      <path d="m11.9 25.1 1.8-.8 1.5 1.3v-1l-.1-.4h1.9l-.1.4v1l1.5-1.3 1.8.8-1.6 1.3H13.5l-1.6-1.3Z" fill="#161616" />
      <path d="m18.3 22.4 1.5 1.3-1.3 1-.3-.2v-2.1Zm-4.6 0v2.1l-.3.2-1.3-1 1.6-1.3Z" fill="#763E1A" />
      <path d="m24.6 11.2 1.4 7-1.8-.1-3.9.3-2.7-.1h-3.9l-2.7.1-3.9-.3-1.8.1 1.4-7 6.1 4.3-1 3.4 2.7-.1h3.9l2.8.1-1-3.4 6-4.3Z" fill="#F6851B" />
    </svg>
  );
}

function WalletConnectIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="10" fill="#3B99FC" />
      <path d="M9.7 12.7c3.5-3.5 9.1-3.5 12.6 0l.4.4a.7.7 0 0 1 0 1l-1.4 1.5a.4.4 0 0 1-.6 0l-.7-.8a5.3 5.3 0 0 0-7.9 0l-.8.8a.4.4 0 0 1-.5 0L9.3 14a.7.7 0 0 1 0-1l.4-.4Zm15.4 2.9 1.3 1.3a.7.7 0 0 1 0 1L20.5 24a.7.7 0 0 1-1 0l-4.1-4.1a.2.2 0 0 0-.3 0L11 24a.7.7 0 0 1-1 0l-5.9-6a.7.7 0 0 1 0-1l1.3-1.3a.7.7 0 0 1 1 0l4.1 4.1a.2.2 0 0 0 .3 0l4.1-4.1a.7.7 0 0 1 1 0l4.1 4.1a.2.2 0 0 0 .3 0l4.1-4.1a.7.7 0 0 1 1 0Z" fill="white" />
    </svg>
  );
}

function CoinbaseIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="#0052FF" />
      <path d="M16 8.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 1 0 0-15Zm-4 6.5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1Z" fill="white" />
    </svg>
  );
}

const walletIcons = {
  metaMask: MetaMaskIcon,
  walletConnect: WalletConnectIcon,
  coinbaseWallet: CoinbaseIcon,
};

function getErrorMessage(error) {
  if (!error) return "";
  if (error.message?.includes("User rejected")) return "Connection request was rejected.";
  if (error.message?.includes("Connector not found")) return "Selected wallet is not available in this browser.";
  return error.message || "Unable to connect wallet.";
}

export default function WalletModal() {
  const { walletModalOpen, closeWalletModal } = useWalletUi();
  const { connectAsync, connectors, isPending, variables, error } = useConnect();
  const [activeWallet, setActiveWallet] = useState("");
  const [localError, setLocalError] = useState("");

  const connectorMap = useMemo(() => {
    const map = new Map();
    for (const connector of connectors) {
      map.set(connector.type || connector.id, connector);
      map.set(connector.id, connector);
    }
    return map;
  }, [connectors]);

  useEffect(() => {
    if (!walletModalOpen) {
      setActiveWallet("");
      setLocalError("");
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeWalletModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeWalletModal, walletModalOpen]);

  async function handleConnect(walletId) {
    const connector = connectorMap.get(walletId);

    if (!connector) {
      setLocalError(
        walletId === "walletConnect"
          ? "WalletConnect needs NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your frontend environment."
          : "This wallet connector is unavailable.",
      );
      return;
    }

    setActiveWallet(walletId);
    setLocalError("");

    try {
      await connectAsync({ connector });
      closeWalletModal();
    } catch (connectError) {
      setLocalError(getErrorMessage(connectError));
    } finally {
      setActiveWallet("");
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition duration-200 ${
        walletModalOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!walletModalOpen}
    >
      <button
        type="button"
        aria-label="Close wallet modal"
        onClick={closeWalletModal}
        className={`absolute inset-0 bg-slate-950/70 backdrop-blur-md transition duration-200 ${
          walletModalOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`glass-border relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-2xl transition duration-200 sm:p-7 ${
          walletModalOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
      >
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Wallet Access</p>
          <h3 className="mt-2 text-2xl font-medium text-white">Connect Wallet</h3>
          <p className="mt-2 text-sm text-slate-400">Choose your preferred wallet</p>
        </div>

        <div className="space-y-3">
          {walletOptions.map((wallet) => {
            const Icon = walletIcons[wallet.id];
            const connector = connectorMap.get(wallet.id);
            const connecting =
              isPending &&
              (variables?.connector?.type === wallet.id ||
                variables?.connector?.id === wallet.id ||
                activeWallet === wallet.id);

            return (
              <button
                key={wallet.id}
                type="button"
                onClick={() => handleConnect(wallet.id)}
                disabled={connecting}
                className={`group flex w-full items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition ${
                  connector
                    ? "border-white/10 bg-white/[0.03] hover:border-accent/30 hover:bg-white/[0.06]"
                    : "border-white/8 bg-white/[0.02] opacity-70"
                } disabled:cursor-wait`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Icon />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">{wallet.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{wallet.subtitle}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  {connecting ? "Connecting..." : "Select"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 min-h-6 text-sm text-rose-300">
          {localError || getErrorMessage(error)}
        </div>
      </div>
    </div>
  );
}
