"use client";

import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privascore.app";
const appIconUrl = `${appUrl}/privascore-icon.svg`;

const connectors = [
  metaMask({
    dappMetadata: {
      name: "PrivaScore",
      url: appUrl,
      iconUrl: appIconUrl,
    },
  }),
  coinbaseWallet({
    appName: "PrivaScore",
    appLogoUrl: appIconUrl,
  }),
];

if (walletConnectProjectId) {
  connectors.splice(
    1,
    0,
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: "PrivaScore",
        description: "Private on-chain credit scoring for DeFi lending.",
        url: appUrl,
        icons: [appIconUrl],
      },
      showQrModal: true,
    }),
  );
}

export const walletOptions = [
  {
    id: "metaMask",
    title: "MetaMask",
    subtitle: "Browser wallet",
  },
  {
    id: "walletConnect",
    title: "WalletConnect",
    subtitle: walletConnectProjectId
      ? "Mobile and desktop wallets"
      : "Requires NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
  },
  {
    id: "coinbaseWallet",
    title: "Coinbase Wallet",
    subtitle: "Self-custody wallet",
  },
];

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  connectors,
  ssr: false,
  transports: {
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
  },
});
