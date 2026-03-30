"use client";

import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
// These direct file imports avoid pulling in optional connector exports such as
// `porto`, which break the Next.js static build in this project setup.
import { coinbaseWallet } from "../node_modules/@wagmi/connectors/dist/esm/coinbaseWallet.js";
import { metaMask } from "../node_modules/@wagmi/connectors/dist/esm/metaMask.js";
import { walletConnect } from "../node_modules/@wagmi/connectors/dist/esm/walletConnect.js";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const connectors = [
  metaMask({
    dappMetadata: {
      name: "PrivaScore",
      url: "https://privascore.app",
      iconUrl: "/privascore-icon.svg",
    },
  }),
  coinbaseWallet({
    appName: "PrivaScore",
    appLogoUrl: "/privascore-icon.svg",
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
        url: "https://privascore.app",
        icons: ["/privascore-icon.svg"],
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
  ssr: true,
  transports: {
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
  },
});
