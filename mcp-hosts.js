/**
 * MCP host install constants shared by the `proofable` CLI and product UI.
 * Browser-safe: no Node-only APIs except the Buffer fallback for non-browser tests.
 */

import { PROOFABLE_AUTH_NPX, PROOFABLE_NPX, PROOFABLE_SETUP_CLI, PROOFABLE_SETUP_NPX } from './cli-commands.js';

export {
  PROOFABLE_PKG,
  PROOFABLE_INSTALL_CLI,
  PROOFABLE_NPX,
  PROOFABLE_SETUP_CLI,
  PROOFABLE_SETUP_NPX,
  PROOFABLE_AUTH_CLI,
  PROOFABLE_DOCTOR_CLI,
  PROOFABLE_EXAMPLES_CLI,
  PROOFABLE_AUTH_NPX,
  PROOFABLE_DOCTOR_NPX,
  PROOFABLE_EXAMPLES_NPX,
  PROOFABLE_QUICKSTART_NPX,
  PROOFABLE_MOUNT_WORKFLOW,
  proofableMountApply,
  proofableMountApplyNpx,
  proofableCmd,
  proofableNpx
} from './cli-commands.js';

/** Server key written into client MCP config, and the label users see in the host. */
export const PROOFABLE_MCP_SERVER_NAME = 'proofable';
/** Canonical config key. Historical keys are not accepted as aliases. */
export const MCP_SERVER_KEYS = [PROOFABLE_MCP_SERVER_NAME];
/** Keys removed during setup/disconnect so an old user entry cannot shadow the plugin. */
export const MCP_SERVER_CLEANUP_KEYS = [PROOFABLE_MCP_SERVER_NAME, 'neus'];
export const PROOFABLE_MCP_URL = 'https://mcp.proofable.me/mcp';
export const PROOFABLE_MCP_SETUP_DOCS_URL = 'https://docs.proofable.me/mcp/setup';

/** CLI `proofable setup --client` values. */
export const MCP_INSTALL_CLIENTS = ['claude', 'codex', 'cursor', 'vscode'];

/**
 * Deep-link shortcut hosts the product UI renders one-click buttons for.
 *
 * These four are conveniences, not the compatibility boundary: Proofable works
 * with any MCP client through the canonical endpoint. Product surfaces pair
 * this list with an always-present generic/any-client path so the list never
 * reads as "these are the only supported hosts".
 */
export const MCP_INSTALL_SHORTCUT_HOSTS = ['cursor', 'claude', 'codex', 'vscode'];

export const IDE_HOST_LABELS = {
  cursor: 'Cursor',
  claude: 'Claude Code',
  codex: 'Codex',
  vscode: 'VS Code'
};

/**
 * IDE host brand logo paths.
 *
 * These four URLs mirror `FIRST_PARTY_ASSETS.brandLogos.{cursor,anthropic,openai,microsoft}`
 * in the product `utils/imageUtils.ts` (LobeHub catalog). This file is the shared
 * This file is the canonical CLI/SDK source; the product app mirrors it.
 * When a logo URL changes, update both files in sync.
 */
export const IDE_HOST_BRAND_LOGOS = {
  cursor: 'https://unpkg.com/@lobehub/icons-static-png@1.91.0/dark/cursor.png',
  claude: 'https://unpkg.com/@lobehub/icons-static-png@1.91.0/dark/anthropic.png',
  codex: 'https://unpkg.com/@lobehub/icons-static-png@1.91.0/dark/openai.png',
  vscode: 'https://unpkg.com/@lobehub/icons-static-svg@1.91.0/icons/microsoft-color.svg'
};

/**
 * Normalize an access key and decide whether it is a static Profile access key
 * (`npk_…`) or a JWT-shaped OAuth access token. OAuth tokens are never written
 * as a static Bearer header because IDE MCP clients cannot refresh them.
 *
 * @param {string | null | undefined} accessKey
 * @returns {string} The normalized key, or an empty string for OAuth-only mode.
 */
function normalizeAccessKey(accessKey) {
  const key = String(accessKey || '').trim();
  // OAuth access tokens are JWTs (three dot-separated base64url segments). Never write
  // them as a static Bearer header — return URL-only so the IDE runs OAuth itself.
  if (key && !key.startsWith('npk_') && key.split('.').length === 3) {
    return '';
  }
  return key;
}

/**
 * Build the MCP HTTP server config for an IDE/client.
 *
 * Two paths, one session model — same Proofable Profile/Account either way:
 *
 * - `npk_…` Profile access keys are durable (never expire). Written as a static
 *   `Authorization: Bearer npk_…` header. Used for servers, CI, and automation
 *   where browser OAuth is unavailable.
 * - OAuth (default): we return a URL-only config (no `headers`). The host
 *   discovers OAuth metadata from the server's `401 + WWW-Authenticate`
 *   challenge, then runs its own DCR + PKCE + silent-refresh lifecycle.
 *   The access token is a short-lived JWT refreshed silently by the host
 *   for up to 30 days via the `offline_access` refresh token; the session
 *   is long-lived, the access token is not.
 *
 * A raw OAuth access token (JWT) is never written as a static Bearer header: IDE
 * MCP clients cannot refresh a static header, and writing one would create a
 * session that dies when the access token expires. URL-only config is the correct
 * OAuth path and is what `proofable setup` produces for host-Connect clients.
 *
 * @param {string | null | undefined} accessKey
 * @returns {{ type: 'http'; url: string; headers?: { Authorization: string } }}
 */
export function buildMcpHttpConfig(accessKey) {
  const key = normalizeAccessKey(accessKey);
  return {
    type: 'http',
    url: PROOFABLE_MCP_URL,
    ...(key ? { headers: { Authorization: `Bearer ${key}` } } : {})
  };
}

/**
 * Build the Cursor-native MCP server config.
 *
 * Cursor's `mcp.json` does not use the spec `type: 'http'` field; it expects a
 * top-level `mcpServers.<name>` object with a `url` field (and optional static
 * `headers` for access keys). OAuth discovery is driven by the server's 401
 * `WWW-Authenticate` challenge.
 *
 * @param {string | null | undefined} accessKey
 * @returns {{ url: string; headers?: { Authorization: string } }}
 */
export function buildCursorMcpConfig(accessKey) {
  const key = normalizeAccessKey(accessKey);
  return {
    url: PROOFABLE_MCP_URL,
    ...(key ? { headers: { Authorization: `Bearer ${key}` } } : {})
  };
}

/**
 * Build the VS Code-native MCP server config.
 *
 * VS Code's `mcp.json` uses the spec-compliant `type: 'http'` field.
 *
 * @param {string | null | undefined} accessKey
 * @returns {{ type: 'http'; url: string; headers?: { Authorization: string } }}
 */
export function buildVsCodeMcpConfig(accessKey) {
  return buildMcpHttpConfig(accessKey);
}

/**
 * Build the copy-paste `mcpServers` JSON block for any generic MCP client
 * (ChatGPT, Claude Desktop, Warp, headless agents, gateways, custom hosts).
 *
 * This is the universal connection contract, not a host-specific adapter:
 * URL-only means OAuth (the host runs Connect + PKCE); an `npk_*` Profile
 * access key is written as a static Bearer header for servers, CI, and
 * automation. OAuth JWTs are never frozen into static config.
 *
 * With `envVar: true` the Authorization value becomes
 * `${PROOFABLE_ACCESS_KEY}` (the canonical CLI/CI environment variable), so
 * the printed block never contains a secret. This is explicit caller intent:
 * it always emits the access-key header template, with or without a key in
 * hand — the runtime that resolves the interpolation supplies the value.
 *
 * @param {string | null | undefined} accessKey
 * @param {{ envVar?: boolean }} [options] - emit the `${PROOFABLE_ACCESS_KEY}` template instead of a literal key
 * @returns {string} JSON text, ready to paste into any client's MCP config
 */
export function buildGenericMcpJsonConfig(accessKey, options = {}) {
  if (options?.envVar) {
    return JSON.stringify(
      {
        mcpServers: {
          [PROOFABLE_MCP_SERVER_NAME]: {
            type: 'http',
            url: PROOFABLE_MCP_URL,
            headers: { Authorization: 'Bearer ${PROOFABLE_ACCESS_KEY}' }
          }
        }
      },
      null,
      2,
    );
  }
  const key = normalizeAccessKey(accessKey);
  if (!key) return buildGenericMcpJsonConfigUrlOnly();
  return JSON.stringify(
    { mcpServers: { [PROOFABLE_MCP_SERVER_NAME]: buildMcpHttpConfig(key) } },
    null,
    2,
  );
}

/** URL-only OAuth block: any host runs Connect + PKCE on the canonical endpoint. */
export function buildGenericMcpJsonConfigUrlOnly() {
  return JSON.stringify(
    { mcpServers: { [PROOFABLE_MCP_SERVER_NAME]: { type: 'http', url: PROOFABLE_MCP_URL } } },
    null,
    2,
  );
}

/**
 * @param {'claude' | 'codex' | 'cursor' | 'vscode'} client
 * @returns {string}
 */
export function buildAuthCommandForClient(client) {
  if (client === 'codex') {
    return `${PROOFABLE_AUTH_NPX} --client codex`;
  }
  return PROOFABLE_SETUP_NPX;
}

/**
 * Copy-paste block for Profile / IDE onboarding (install + setup + auth).
 * @param {'claude' | 'codex' | 'cursor' | 'vscode'} client
 * @param {string | null | undefined} accessKey
 * @returns {string}
 */
export function buildSetupCommandForClient(client, accessKey) {
  const key = String(accessKey || '').trim();
  return key
    ? `${PROOFABLE_NPX} setup --client ${client} --access-key ${key}`
    : `${PROOFABLE_NPX} setup --client ${client}`;
}

/**
 * @param {'cursor' | 'claude' | 'codex'} host
 * @param {string | null | undefined} accessKey
 * @returns {string}
 */
export function buildSetupCommandForHost(host, accessKey) {
  return buildSetupCommandForClient(host, accessKey);
}

/**
 * Public CLI form for product UI. Not the npm one-liner.
 * @param {'claude' | 'codex' | 'cursor' | 'vscode'} client
 * @param {string | null | undefined} accessKey
 * @returns {string}
 */
export function buildSetupCliCommandForClient(client, accessKey) {
  const key = String(accessKey || '').trim();
  return key
    ? `${PROOFABLE_SETUP_CLI} --client ${client} --access-key ${key}`
    : `${PROOFABLE_SETUP_CLI} --client ${client}`;
}

export function buildSetupCliCommandForHost(host, accessKey) {
  return buildSetupCliCommandForClient(host, accessKey);
}

/**
 * Zero-install one-liner for landing pages and copy buttons.
 * @param {'claude' | 'codex' | 'cursor' | 'vscode'} [client]
 */
export function buildSetupNpxOneLiner(client) {
  if (!client) return PROOFABLE_SETUP_NPX;
  return `${PROOFABLE_NPX} setup --client ${client}`;
}

/** Claude Code marketplace plugin. Cursor/Codex use their own plugin UIs. */
export const CLAUDE_PLUGIN_INSTALL = '/plugin install proofable-mcp@proofable';

function encodeJsonBase64(value) {
  const json = JSON.stringify(value);
  if (typeof globalThis.Buffer === 'function') {
    return globalThis.Buffer.from(json, 'utf8').toString('base64');
  }
  return btoa(json);
}

/**
 * Official Cursor one-click MCP install (docs: cursor.com/docs/mcp/install-links).
 * Registers the hosted URL. Cursor then shows Connect for OAuth.
 * Does not invent a marketplace listing URL.
 */
export function buildCursorMcpInstallHref() {
  // Official Cursor format: name= query + config= base64(transport only).
  // Docs example encodes `{ command, args }`, not `{ postgres: { command, args } }`.
  const config = buildCursorMcpConfig(null);
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(PROOFABLE_MCP_SERVER_NAME)}&config=${encodeURIComponent(encodeJsonBase64(config))}`;
}

/** VS Code MCP install deeplink (spec `type: http`). */
export function buildVsCodeMcpInstallHref() {
  const payload = {
    name: PROOFABLE_MCP_SERVER_NAME,
    ...buildVsCodeMcpConfig(null)
  };
  return `vscode:mcp/install?${encodeURIComponent(JSON.stringify(payload))}`;
}
