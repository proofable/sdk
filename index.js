
export { ProofableClient } from './client.js';

export {
  PORTABLE_PROOF_SIGNER_HEADER,
  canonicalizePortableProofJson,
  constructVerificationMessage,
  computePortableProofQHash,
  verifyPortableProofEnvelope,
  validateWalletAddress,
  validateUniversalAddress,
  validateTimestamp,
  validateQHash,
  normalizeAddress,
  isTerminalStatus,
  isSuccessStatus,
  isFailureStatus,
  formatVerificationStatus,
  formatTimestamp,
  isSupportedChain,
  StatusPoller,
  computeContentHash,
  deriveDid,
  toHexUtf8,
  resolveDID,
  signMessage,
  standardizeVerificationRequest,
  resolveZkPassportConfig,
  validateVerifierPayload,
  buildVerificationRequest,
  createVerificationData,
  validateSignatureComponents,
  withRetry,
  delay,
  PROOFABLE_CONSTANTS,
  DEFAULT_HOSTED_VERIFY_URL,
  getHostedCheckoutUrl,
  getHostedAgentCreateUrl,
  toAgentDelegationMaxSpend
} from './utils.js';

export {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
  GATE_NFT_HOLDER,
  GATE_TOKEN_HOLDER,
  GATE_CONTRACT_ADMIN,
  GATE_DOMAIN_OWNER,
  GATE_LINKED_WALLETS,
  GATE_AGENT_IDENTITY,
  GATE_AGENT_DELEGATION,
  GATE_CONTENT_MODERATION,
  GATE_WALLET_RISK,
  GATE_PSEUDONYM,
  createGate,
  combineGates
} from './gates.js';

export { fetchSponsorGrant } from './sponsor.js';

export {
  RUNTIME_MOUNT_SCHEMA,
  normalizeWallet,
  normalizeQHash,
  isDelegationExpired,
  pickIdentity,
  pickActiveDelegation,
  resolveEffectiveRuntime,
  extractAgentContextFromProofs,
  buildRuntimeBundle,
  profileAgentToIdentitySeed,
  isRuntimeBundle,
  resolveRuntimeBundleFromMcp,
  evaluateMountFileHealth
} from './runtime-mount.js';

// Node-only adapters (fs/path): import `@proofable/sdk/runtime-adapters` — not re-exported here (Next/webpack safe).

export {
  SDKError,
  ApiError,
  ValidationError,
  NetworkError,
  ConfigurationError,
  VerificationError,
  AuthenticationError
} from './errors.js';

// CLI command strings and MCP host config live in `./mcp-hosts.js` and
// `./cli-commands.js`. They are internal to the `proofable` CLI and are not
// part of the published API.

export default {
  ProofableClient: () => import('./client.js').then((m) => m.ProofableClient),
  toString: () => '[proofable/sdk]'
};
