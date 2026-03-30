// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title PrivaScore
 * @notice Private on-chain credit scoring for DeFi.
 *
 *  - Oracle assigns encrypted euint32 scores via FHE.asEuint32().
 *  - Lenders call isEligible() which computes FHE.gte() and stores the
 *    encrypted ebool result. The lender fetches the ctHash and unseals
 *    off-chain using cofhejs — they never see the raw score.
 *  - Users call getMyScoreHash() to get their ctHash and unseal off-chain
 *    using cofhejs.unseal(ctHash, FheTypes.Uint32).
 *
 * @dev cofhe-contracts 0.1.x does not ship PermissionedV2.sol or sealoutput.
 *      Access control is enforced via FHE.allow() — only addresses that have
 *      been `allow()`-ed for a ctHash can decrypt it via the CoFHE network.
 *
 *      Deployed on Arbitrum Sepolia (chainId 421614)
 */
contract PrivaScore {

    // ─── State ────────────────────────────────────────────────────────────────

    address public owner;
    address public oracle;

    mapping(address => euint32) private _scores;
    mapping(address => bool)    public  registeredLenders;

    /// @dev Stores the ebool ctHash of the most recent isEligible() call per lender.
    mapping(address => ebool) private _lastEligCheck;

    // ─── Events ───────────────────────────────────────────────────────────────

    event ScoreUpdated(address indexed wallet);
    event LenderRegistered(address indexed lender);
    event EligibilityChecked(address indexed wallet, address indexed lender);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotOracle();
    error NotOwner();
    error NotRegisteredLender();
    error NoScoreAssigned();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOracle() {
        if (msg.sender != oracle) revert NotOracle();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyLender() {
        if (!registeredLenders[msg.sender]) revert NotRegisteredLender();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _oracle) {
        owner  = msg.sender;
        oracle = _oracle;
    }

    // ─── Oracle ───────────────────────────────────────────────────────────────

    /**
     * @notice Oracle assigns or updates an encrypted credit score for a wallet.
     *         The score is stored as a euint32 ctHash. FHE.allow() grants the
     *         wallet and oracle off-chain decryption rights via cofhejs.
     */
    function updateScore(address wallet, InEuint32 calldata encScore) external onlyOracle {
        euint32 score = FHE.asEuint32(encScore);

        FHE.allowThis(score);          // contract can reference this ctHash
        FHE.allow(score, wallet);      // wallet owner can unseal via cofhejs
        FHE.allow(score, oracle);      // oracle can audit

        _scores[wallet] = score;
        emit ScoreUpdated(wallet);
    }

    // ─── Owner ────────────────────────────────────────────────────────────────

    /**
     * @notice Owner registers a lender address allowed to call isEligible().
     */
    function registerLender(address lender) external onlyOwner {
        registeredLenders[lender] = true;
        emit LenderRegistered(lender);
    }

    // ─── Lender ───────────────────────────────────────────────────────────────

    /**
     * @notice Registered lender checks if a wallet's score >= threshold.
     *         Computes FHE.gte() and stores the encrypted ebool result.
     *         The lender must retrieve the ctHash via getEligCheckHash()
     *         and unseal it off-chain using cofhejs.unseal(ctHash, FheTypes.Bool).
     *
     *         The raw score is NEVER exposed — only the encrypted boolean result.
     *
     * @param wallet     Wallet to evaluate.
     * @param threshold  Minimum score threshold (encrypted by lender off-chain).
     * @return           The ebool ctHash of the eligibility result.
     */
    function isEligible(address wallet, InEuint32 calldata threshold)
        external
        onlyLender
        returns (ebool)
    {
        if (!FHE.isInitialized(_scores[wallet])) revert NoScoreAssigned();

        euint32 thresh   = FHE.asEuint32(threshold);
        ebool   eligible = FHE.gte(_scores[wallet], thresh);

        FHE.allowThis(eligible);
        FHE.allow(eligible, msg.sender);  // lender can unseal the result

        _lastEligCheck[msg.sender] = eligible;
        emit EligibilityChecked(wallet, msg.sender);
        return eligible;
    }

    /**
     * @notice Returns the bytes32 ctHash of the lender's most recent eligibility result.
     *         Pass this to cofhejs.unseal(ctHash, FheTypes.Bool) to get true/false.
     */
    function getEligCheckHash(address lender) external view returns (bytes32) {
        return ebool.unwrap(_lastEligCheck[lender]);
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    /**
     * @notice Returns the bytes32 ctHash of the caller's encrypted credit score.
     *         Only the wallet that was grant-ed FHE.allow() when the score was
     *         assigned can decrypt it. Pass this to:
     *           cofhejs.unseal(BigInt(ctHash), FheTypes.Uint32)
     *         to view the score locally.
     */
    function getMyScoreHash() external view returns (bytes32) {
        if (!FHE.isInitialized(_scores[msg.sender])) revert NoScoreAssigned();
        return euint32.unwrap(_scores[msg.sender]);
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    /**
     * @notice Returns whether a wallet has been assigned a score yet.
     */
    function hasScore(address wallet) public view returns (bool) {
        return FHE.isInitialized(_scores[wallet]);
    }
}
