import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { cofhejs, Encryptable, FheTypes } from "cofhejs/web";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const ORACLE_ADDRESS   = (import.meta.env.VITE_ORACLE_ADDRESS || "").toLowerCase();

// Minimal ABI — only what the frontend calls
const ABI = [
  // Oracle
  "function updateScore(address wallet, tuple(bytes32 ctHash, bytes signature) encScore) external",
  // Owner
  "function registerLender(address lender) external",
  // Lender
  "function isEligible(address wallet, tuple(bytes32 ctHash, bytes signature) threshold) external returns (bytes32)",
  "function getEligCheckHash(address lender) view returns (bytes32)",
  // User
  "function getMyScoreHash() view returns (bytes32)",
  // View
  "function hasScore(address wallet) view returns (bool)",
  "function oracle() view returns (address)",
  "function registeredLenders(address) view returns (bool)",
];

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page:    { minHeight: "100vh", background: "#080812", color: "#e0e0ff", padding: "40px 20px", fontFamily: "system-ui, monospace" },
  wrap:    { maxWidth: 580, margin: "0 auto" },
  header:  { textAlign: "center", marginBottom: 36 },
  h1:      { fontSize: 34, margin: 0, letterSpacing: -1 },
  sub:     { color: "#6666aa", fontSize: 13, marginTop: 6 },
  addr:    { color: "#9988ff", fontFamily: "monospace", fontSize: 12 },
  oracle:  { marginLeft: 8, color: "#facc15", fontSize: 11, fontWeight: 700 },
  card:    { background: "#10102a", border: "1px solid #252545", borderRadius: 14, padding: "24px 28px", marginBottom: 20 },
  oCard:   { background: "#1a1200", border: "1px solid #4a3600", borderRadius: 14, padding: "24px 28px", marginBottom: 20 },
  h2:      { margin: "0 0 4px 0", fontSize: 17, fontWeight: 600 },
  desc:    { color: "#6666aa", fontSize: 13, margin: "0 0 18px 0" },
  label:   { fontSize: 12, color: "#8888bb", display: "block", marginBottom: 4, marginTop: 12 },
  input:   { background: "#080820", border: "1px solid #2a2a50", borderRadius: 8, color: "#e0e0ff", padding: "10px 14px", fontSize: 14, width: "100%", boxSizing: "border-box" },
  btn:     { background: "#5c52f0", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 14 },
  oBtn:    { background: "#c47c00", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 14 },
  connectBtn: { background: "#5c52f0", color: "#fff", border: "none", borderRadius: 10, padding: "14px 40px", cursor: "pointer", fontWeight: 700, fontSize: 16 },
  score:   { marginTop: 16, padding: "20px", background: "#0a0a28", borderRadius: 10, textAlign: "center" },
  scoreN:  { fontSize: 56, fontWeight: 700, color: "#7c6fff" },
  scoreLb: { fontSize: 12, color: "#6666aa", marginTop: 4 },
  ok:      { marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#0a2a14", color: "#4ade80", fontSize: 13 },
  err:     { marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#2a0a0a", color: "#f87171", fontSize: 13, wordBreak: "break-all" },
  approved: { marginTop: 16, padding: "18px", background: "#061a0c", borderRadius: 10, textAlign: "center", border: "1px solid #166534" },
  denied:   { marginTop: 16, padding: "18px", background: "#1a0606", borderRadius: 10, textAlign: "center", border: "1px solid #7f1d1d" },
  verdict:  (ok) => ({ fontSize: 28, fontWeight: 700, color: ok ? "#4ade80" : "#f87171" }),
  verdictSub: { fontSize: 12, color: "#6666aa", marginTop: 4 },
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function PrivaScoreApp() {
  const [signer, setSigner]     = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount]   = useState("");
  const [isOracle, setIsOracle] = useState(false);

  // User section
  const [myScore, setMyScore]       = useState(null);
  const [userStatus, setUserStatus] = useState({ msg: "", ok: true });
  const [userBusy, setUserBusy]     = useState(false);

  // Lender section
  const [lWallet, setLWallet]         = useState("");
  const [lThreshold, setLThreshold]   = useState("");
  const [eligResult, setEligResult]   = useState(null); // true | false | null
  const [lenderStatus, setLenderStatus] = useState({ msg: "", ok: true });
  const [lenderBusy, setLenderBusy]   = useState(false);

  // Oracle section
  const [oWallet, setOWallet]       = useState("");
  const [oScore, setOScore]         = useState("");
  const [oStatus, setOStatus]       = useState({ msg: "", ok: true });
  const [oBusy, setOBusy]           = useState(false);

  // ── Connect ────────────────────────────────────────────────────────────────

  async function initCofhejs(provider, _signer) {
    const initResult = await cofhejs.initializeWithEthers({
      ethersProvider: provider,
      ethersSigner: _signer,
      environment: "TESTNET",  // Fhenix Nitrogen — public CoFHE node
    });
    if (initResult?.error) throw new Error("cofhejs: " + initResult.error.message);
    console.log("cofhejs initialized ok");
  }

  async function connect() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const _signer = await provider.getSigner();
      const addr    = (await _signer.getAddress()).toLowerCase();
      const _contract = new Contract(CONTRACT_ADDRESS, ABI, _signer);
      setSigner(_signer);
      setContract(_contract);
      setAccount(addr);
      setIsOracle(addr === ORACLE_ADDRESS);
      // Initialize cofhejs in background — non-blocking
      initCofhejs(provider, _signer).catch(e => console.warn("cofhejs init:", e.message));
    } catch (e) {
      alert("Wallet connection failed: " + e.message);
    }
  }

  // ── User: Check My Score ───────────────────────────────────────────────────

  async function checkMyScore() {
    setUserBusy(true);
    setUserStatus({ msg: "", ok: true });
    setMyScore(null);
    try {
      const addr = await signer.getAddress();

      // Get the ctHash from the contract (only works if FHE.allow(score, addr) was set)
      const ctHash = await contract.connect(signer).getMyScoreHash();

      setUserStatus({ msg: "Unsealing score via CoFHE network…", ok: true });

      // Unseal off-chain — cofhejs contacts the CoFHE node and decrypts
      const result = await cofhejs.unseal(BigInt(ctHash), FheTypes.Uint32, addr);
      if (result.error) throw new Error(result.error.message);

      setMyScore(result.data.toString());
      setUserStatus({ msg: "Score successfully decrypted.", ok: true });
    } catch (e) {
      if (e.message?.includes("NoScoreAssigned") || e.reason?.includes("NoScoreAssigned")) {
        setUserStatus({ msg: "No score has been assigned to your wallet yet.", ok: false });
      } else {
        setUserStatus({ msg: "Error: " + (e.reason || e.message), ok: false });
      }
    }
    setUserBusy(false);
  }

  // ── Lender: Check Eligibility ──────────────────────────────────────────────

  async function checkEligibility() {
    if (!lWallet.trim() || !lThreshold.trim()) {
      setLenderStatus({ msg: "Fill in both wallet address and threshold.", ok: false });
      return;
    }
    setLenderBusy(true);
    setLenderStatus({ msg: "", ok: true });
    setEligResult(null);
    try {
      const lenderAddr = await signer.getAddress();

      // Encrypt the threshold locally before sending to chain
      const encResult = await cofhejs.encrypt(
        () => {},
        [Encryptable.uint32(BigInt(lThreshold))]
      );
      if (encResult.error) throw new Error(encResult.error.message);
      const [encThreshold] = encResult.data;

      // Submit isEligible tx — FHE.gte() is computed by the CoFHE TaskManager
      setLenderStatus({ msg: "Submitting eligibility check…", ok: true });
      const tx = await contract.connect(signer).isEligible(lWallet.trim(), encThreshold);
      await tx.wait();

      // Retrieve the ebool ctHash that was stored on-chain
      const ctHash = await contract.getEligCheckHash(lenderAddr);

      setLenderStatus({ msg: "Waiting for FHE computation to resolve…", ok: true });

      // Unseal the ebool off-chain
      const result = await cofhejs.unseal(BigInt(ctHash), FheTypes.Bool, lenderAddr);
      if (result.error) throw new Error(result.error.message);

      setEligResult(result.data);
      setLenderStatus({
        msg: result.data
          ? "Wallet meets the minimum score threshold."
          : "Wallet does not meet the minimum score threshold.",
        ok: result.data,
      });
    } catch (e) {
      if (e.reason?.includes("NotRegisteredLender") || e.message?.includes("NotRegisteredLender")) {
        setLenderStatus({ msg: "Error: Your wallet is not a registered lender.", ok: false });
      } else if (e.reason?.includes("NoScoreAssigned") || e.message?.includes("NoScoreAssigned")) {
        setLenderStatus({ msg: "Error: That wallet has no score assigned yet.", ok: false });
      } else {
        setLenderStatus({ msg: "Error: " + (e.reason || e.message), ok: false });
      }
    }
    setLenderBusy(false);
  }

  // ── Oracle: Update Score ───────────────────────────────────────────────────

  async function updateScore() {
    if (!oWallet.trim() || !oScore.trim()) {
      setOStatus({ msg: "Fill in both wallet address and score value.", ok: false });
      return;
    }
    setOBusy(true);
    setOStatus({ msg: "", ok: true });
    try {
      // Encrypt the score locally — it never leaves the browser in plaintext
      const encResult = await cofhejs.encrypt(
        () => {},
        [Encryptable.uint32(BigInt(oScore))]
      );
      if (encResult.error) throw new Error(encResult.error.message);
      const [encScore] = encResult.data;

      const tx = await contract.connect(signer).updateScore(oWallet.trim(), encScore);
      await tx.wait();

      setOStatus({ msg: `Score assigned to ${oWallet.trim().slice(0,8)}…`, ok: true });
      setOWallet("");
      setOScore("");
    } catch (e) {
      setOStatus({ msg: "Error: " + (e.reason || e.message), ok: false });
    }
    setOBusy(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!signer) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={S.header}>
          <h1 style={S.h1}>🔒 PrivaScore</h1>
          <p style={S.sub}>Private on-chain credit scoring for DeFi</p>
          <p style={{ ...S.sub, marginBottom: 28 }}>Scores are encrypted end-to-end — lenders see eligibility, never the raw number.</p>
          <button style={S.connectBtn} onClick={connect}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <h1 style={S.h1}>🔒 PrivaScore</h1>
          <p style={S.sub}>
            <span style={S.addr}>{account.slice(0,6)}…{account.slice(-4)}</span>
            {isOracle && <span style={S.oracle}>◆ ORACLE</span>}
          </p>
        </div>

        {/* ── Section 1: User ── */}
        <div style={S.card}>
          <h2 style={S.h2}>📊 My Credit Score</h2>
          <p style={S.desc}>
            Only you can decrypt your score. The number never appears on-chain.
          </p>
          <button style={S.btn} onClick={checkMyScore} disabled={userBusy}>
            {userBusy ? "Decrypting…" : "Reveal My Score"}
          </button>

          {myScore !== null && (
            <div style={S.score}>
              <div style={S.scoreN}>{myScore}</div>
              <div style={S.scoreLb}>Your encrypted credit score</div>
            </div>
          )}
          {userStatus.msg && (
            <div style={userStatus.ok && myScore !== null ? S.ok : (userStatus.ok ? S.ok : S.err)}>
              {userStatus.msg}
            </div>
          )}
        </div>

        {/* ── Section 2: Lender ── */}
        <div style={S.card}>
          <h2 style={S.h2}>🏦 Check Eligibility</h2>
          <p style={S.desc}>
            Check if a wallet meets your threshold — without seeing their score.
          </p>

          <label style={S.label}>Wallet Address</label>
          <input style={S.input} placeholder="0x…" value={lWallet} onChange={e => setLWallet(e.target.value)} />

          <label style={S.label}>Minimum Score Threshold</label>
          <input style={S.input} type="number" placeholder="e.g. 650" value={lThreshold} onChange={e => setLThreshold(e.target.value)} />

          <button style={S.btn} onClick={checkEligibility} disabled={lenderBusy}>
            {lenderBusy ? "Checking…" : "Check Eligibility"}
          </button>

          {eligResult !== null && (
            <div style={eligResult ? S.approved : S.denied}>
              <div style={S.verdict(eligResult)}>{eligResult ? "✅ APPROVED" : "❌ DENIED"}</div>
              <div style={S.verdictSub}>
                Score {eligResult ? "meets" : "does not meet"} threshold of {lThreshold}
              </div>
            </div>
          )}
          {lenderStatus.msg && (
            <div style={lenderStatus.ok ? S.ok : S.err}>{lenderStatus.msg}</div>
          )}
        </div>

        {/* ── Section 3: Oracle (only shown for oracle address) ── */}
        {isOracle && (
          <div style={S.oCard}>
            <h2 style={S.h2}>⚡ Oracle Panel</h2>
            <p style={S.desc}>
              Assign or update an encrypted credit score. The score is encrypted
              client-side before being sent to the chain.
            </p>

            <label style={S.label}>Target Wallet</label>
            <input style={S.input} placeholder="0x…" value={oWallet} onChange={e => setOWallet(e.target.value)} />

            <label style={S.label}>Credit Score (0 – 999)</label>
            <input style={S.input} type="number" min="0" max="999" placeholder="e.g. 750" value={oScore} onChange={e => setOScore(e.target.value)} />

            <button style={S.oBtn} onClick={updateScore} disabled={oBusy}>
              {oBusy ? "Submitting…" : "Assign Score"}
            </button>

            {oStatus.msg && (
              <div style={oStatus.ok ? S.ok : S.err}>{oStatus.msg}</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
