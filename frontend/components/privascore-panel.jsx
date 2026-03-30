"use client";

import { useMemo, useState } from "react";
import { cofhejs, Encryptable, FheTypes } from "cofhejs/web";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { wagmiConfig } from "../lib/wallet-config";
import { useWalletUi } from "./app-providers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const ORACLE_ADDRESS = (process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "").toLowerCase();

const ABI = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "isEligible",
    inputs: [
      { name: "wallet", type: "address" },
      {
        name: "threshold",
        type: "tuple",
        components: [
          { name: "ctHash", type: "bytes32" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getEligCheckHash",
    inputs: [{ name: "lender", type: "address" }],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getMyScoreHash",
    inputs: [],
    outputs: [{ type: "bytes32" }],
  },
];

const initialStatus = { tone: "idle", label: "Encrypted systems standing by." };

function formatAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";
}

function StatusLine({ busy, message, tone }) {
  const color =
    tone === "success"
      ? "text-emerald-300"
      : tone === "error"
        ? "text-rose-300"
        : "text-slate-400";

  return (
    <div className="flex min-h-6 items-center gap-3 text-sm">
      {busy && <span className="h-2.5 w-2.5 animate-pulseSoft rounded-full bg-accent" />}
      <p className={color}>
        {busy ? "Encrypted computation in progress..." : message}
      </p>
    </div>
  );
}

export default function PrivaScorePanel() {
  const { address: account, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openWalletModal } = useWalletUi();
  const [threshold, setThreshold] = useState("700");
  const [score, setScore] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [status, setStatus] = useState(initialStatus);

  const isOracle = useMemo(() => account && account.toLowerCase() === ORACLE_ADDRESS, [account]);

  async function ensureWalletReady() {
    if (!CONTRACT_ADDRESS) {
      throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS. Set your frontend environment variables first.");
    }

    if (!isConnected || !publicClient || !walletClient || !account) {
      openWalletModal();
      throw new Error("Connect a wallet to continue.");
    }

    const initResult = await cofhejs.initializeWithViem({
      viemClient: publicClient,
      viemWalletClient: walletClient,
      environment: "TESTNET",
    });

    if (initResult?.error) {
      throw new Error(initResult.error.message);
    }

    return { account, publicClient, walletClient };
  }

  async function viewScore() {
    setBusyAction("score");
    setScore(null);
    setStatus({ tone: "idle", label: "Unsealing your encrypted score..." });

    try {
      const ctx = await ensureWalletReady();
      const ctHash = await ctx.publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "getMyScoreHash",
        account: ctx.account,
      });
      const result = await cofhejs.unseal(BigInt(ctHash), FheTypes.Uint32, ctx.account);

      if (result.error) {
        throw new Error(result.error.message);
      }

      setScore(result.data.toString());
      setStatus({ tone: "success", label: "Encrypted score retrieved successfully." });
    } catch (error) {
      setStatus({
        tone: "error",
        label: error.reason || error.message || "Unable to retrieve your encrypted score.",
      });
    } finally {
      setBusyAction("");
    }
  }

  async function checkEligibility() {
    if (!threshold.trim()) {
      setStatus({ tone: "error", label: "Enter a threshold before checking eligibility." });
      return;
    }

    setBusyAction("eligibility");
    setEligibility(null);
    setStatus({ tone: "idle", label: "Running encrypted eligibility check..." });

    try {
      const ctx = await ensureWalletReady();
      const encrypted = await cofhejs.encrypt(() => {}, [Encryptable.uint32(BigInt(threshold))]);

      if (encrypted.error) {
        throw new Error(encrypted.error.message);
      }

      const [encThreshold] = encrypted.data;
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "isEligible",
        args: [ctx.account, encThreshold],
        account: ctx.account,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash });

      const ctHash = await ctx.publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "getEligCheckHash",
        args: [ctx.account],
      });
      const result = await cofhejs.unseal(BigInt(ctHash), FheTypes.Bool, ctx.account);

      if (result.error) {
        throw new Error(result.error.message);
      }

      setEligibility(Boolean(result.data));
      setStatus({
        tone: result.data ? "success" : "error",
        label: result.data
          ? "Eligible for the selected threshold."
          : "Not eligible for the selected threshold.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        label: error.reason || error.message || "Eligibility check failed.",
      });
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="glass-border relative overflow-hidden rounded-[2rem] border border-white/10 bg-panel p-6 shadow-panel backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,140,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(157,123,255,0.12),transparent_22%)]" />
      <div className="relative">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Main App Panel</p>
            <h3 className="mt-2 text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Credit decisions without data leakage
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Connect your wallet to reveal your encrypted credit score and run a threshold check on the connected account.
            </p>
          </div>
          {isConnected ? (
            <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm font-medium text-white">
              {formatAddress(account)}
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm font-medium text-white transition hover:border-accent/40 hover:bg-white/10"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[1.5rem] border border-white/8 bg-slate-950/40 p-5 shadow-glow backdrop-blur-xl transition duration-300 hover:border-accent/20 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Your Score</p>
                <h4 className="mt-2 text-xl font-medium text-white">Reveal private score</h4>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-400">
                {isOracle ? "oracle" : "wallet"}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
              <div className="rounded-[1.15rem] border border-accent/15 bg-gradient-to-b from-accent/12 to-transparent px-4 py-6 text-center">
                <p className={`font-mono text-4xl tracking-[0.32em] text-white transition ${score ? "animate-reveal tracking-[0.08em]" : "score-mask blur-[2px] text-slate-300/75"}`}>
                  {score ?? "******"}
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  {score ? "Decrypted locally in your browser" : "Masked until you explicitly reveal it"}
                </p>
              </div>

              <button
                onClick={viewScore}
                disabled={busyAction === "score"}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-accent to-accentSoft px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busyAction === "score" ? "Decrypting..." : "View My Score"}
              </button>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/8 bg-slate-950/40 p-5 shadow-glow backdrop-blur-xl transition duration-300 hover:border-accent/20 sm:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Check Eligibility</p>
              <h4 className="mt-2 text-xl font-medium text-white">Threshold-based lending decision</h4>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Evaluate the connected wallet against a minimum score threshold while keeping the raw score private.
              </p>
            </div>

            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">
              Enter threshold (e.g. 700)
            </label>
            <input
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              inputMode="numeric"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-accent/50 focus:bg-white/[0.07]"
              placeholder="700"
            />

            <button
              onClick={checkEligibility}
              disabled={busyAction === "eligibility"}
              className="mt-5 w-full rounded-2xl border border-white/10 bg-white/8 px-5 py-3 text-sm font-medium text-white transition hover:border-accent/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "eligibility" ? "Checking..." : "Check Eligibility"}
            </button>

            <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Result</p>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4">
                <div>
                  <p className="text-sm text-slate-400">Eligibility badge</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {eligibility === null ? "Awaiting check" : eligibility ? "Eligible" : "Not Eligible"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    eligibility === null
                      ? "border border-white/10 bg-white/5 text-slate-300"
                      : eligibility
                        ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border border-rose-400/20 bg-rose-400/10 text-rose-300"
                  }`}
                >
                  {eligibility === null ? "Pending" : eligibility ? "Eligible" : "Not Eligible"}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-slate-950/35 px-5 py-4 backdrop-blur-xl">
          <StatusLine busy={Boolean(busyAction) && busyAction !== "connect"} message={status.label} tone={status.tone} />
        </div>
      </div>
    </div>
  );
}
