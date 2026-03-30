"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../lib/wallet-config";

const WalletUiContext = createContext(null);

export function useWalletUi() {
  const context = useContext(WalletUiContext);

  if (!context) {
    throw new Error("useWalletUi must be used inside AppProviders.");
  }

  return context;
}

export default function AppProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const value = useMemo(
    () => ({
      walletModalOpen,
      openWalletModal: () => setWalletModalOpen(true),
      closeWalletModal: () => setWalletModalOpen(false),
    }),
    [walletModalOpen],
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletUiContext.Provider value={value}>
          {children}
        </WalletUiContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

