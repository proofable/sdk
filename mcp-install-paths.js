/**
 * MCP install-path truth table — the single source of truth for how a user
 * actually gets Proofable into a given client.
 *
 * Why this file exists
 * --------------------
 * The same four sentences used to be hand-written in the product page, the
 * Connect menus, the CLI hints, the docs, and five READMEs. They drifted, and
 * they were wrong in the same way: they told every client to "Click Connect".
 * Only two clients render a button by that name. Everywhere else the user goes
 * looking for a control that does not exist (Cursor, VS Code, Claude Code,
 * Codex) or is named something else entirely.
 *
 * The rule this table encodes: never name a control. Describe the step the
 * client actually performs, using the client's own vocabulary.
 *
 * Data-only and browser-safe on purpose: no IO, no imports, and every field
 * serializable. The product page, the CLI, the docs and the marketplace
 * manifests all read this one table, and the mirror into the product repo is a
 * copy rather than a re-implementation.
 *
 * Verified against vendor docs on 2026-09-26. When a vendor changes their
 * install flow, change it here and it changes everywhere.
 */

/**
 * How a client receives the server.
 *
 * - `deeplink` — the client has a URL scheme that installs the server on click
 *   (Cursor, VS Code). One step; the client handles the rest.
 * - `plugin`   — the client has a plugin/marketplace bundle that carries skills
 *   and (sometimes) the server (Claude Code, Codex, Cursor, Devin, Antigravity,
 *   Hermes, OpenClaw, ChatGPT).
 * - `command`  — a CLI/config write is the honest full path (Codex, Gemini CLI,
 *   Warp, OpenClaw, Hermes, Cline, JetBrains).
 * - `url`      — paste the endpoint into a settings UI; the host runs its own
 *   sign-in (ChatGPT, Claude web/Desktop connectors, Zed, n8n).
 */
export const MCP_INSTALL_CLASSES = ['deeplink', 'plugin', 'command', 'url'];

/**
 * Who completes authentication after the server is registered.
 *
 * - `host`   — the client opens its own browser sign-in. This is the default
 *   and the only interactive path. Never describe the trigger as a button
 *   unless `connectLabel` is set.
 * - `manual` — no browser sign-in; the user must supply an access key header.
 *   Honest only for servers, CI, containers, and scheduled jobs. Used as the
 *   primary path only where the client documents no OAuth (Cline, JetBrains).
 * - `none`   — nothing to authenticate (discovery/metadata only).
 */
export const MCP_AUTH_OWNERS = ['host', 'manual', 'none'];

/**
 * One record per client.
 *
 * @typedef {object} McpInstallPath
 * @property {string}  id            Stable id; also the `--client` value where one exists.
 * @property {string}  label         Product name the user sees.
 * @property {'ide'|'cli'|'web'|'desktop'|'terminal'|'automation'} kind
 * @property {number}  tier          1 = first-class on /install; 2 = long tail.
 * @property {string}  installClass  One of MCP_INSTALL_CLASSES.
 * @property {'cursor'|'vscode'|null} deeplinkKind  Which builder produces the install href.
 * @property {string}  afterInstall  What the user does next. Never names a control
 *                                   unless the client really renders it.
 * @property {string}  authOwner     One of MCP_AUTH_OWNERS.
 * @property {string|null} connectLabel  The literal button text, ONLY where the
 *                                   client renders such a button (Claude, Devin).
 * @property {boolean} pluginSupport Whether the client accepts a plugin bundle.
 * @property {string}  markKey       Key into the official brand-mark registry.
 * @property {string}  docsUrl       Vendor documentation for the add-server step.
 */

/** @type {ReadonlyArray<McpInstallPath>} */
export const MCP_INSTALL_PATHS = [
  {
    id: 'cursor',
    label: 'Cursor',
    kind: 'ide',
    tier: 1,
    installClass: 'deeplink',
    deeplinkKind: 'cursor',
    // Cursor has no Connect button. The deeplink registers the server; the user
    // enables it in Customize and Cursor runs OAuth itself.
    afterInstall: 'Turn Proofable on in Customize. Cursor opens the sign-in.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'cursor',
    docsUrl: 'https://cursor.com/docs/context/mcp/install-links'
  },
  {
    id: 'vscode',
    label: 'VS Code',
    kind: 'ide',
    tier: 1,
    installClass: 'deeplink',
    deeplinkKind: 'vscode',
    // No Connect button. The server appears in the MCP list and must be started.
    afterInstall: 'Start it from “MCP: List Servers”. VS Code opens the sign-in.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'vscode',
    docsUrl: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers'
  },
  {
    id: 'claude-code',
    label: 'Claude Code',
    kind: 'cli',
    tier: 1,
    installClass: 'plugin',
    deeplinkKind: null,
    // The Proofable plugin is skill-only: it ships the workflow skills and does
    // NOT register the server (see mcp/plugins/proofable-mcp). So this is two
    // honest steps, and the sign-in is a slash command, not a button.
    afterInstall: 'Installs the Proofable skills. Add the server, then run /mcp and sign in.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'claude-code',
    docsUrl: 'https://code.claude.com/docs/en/mcp'
  },
  {
    id: 'claude-connectors',
    label: 'Claude (connectors)',
    kind: 'web',
    tier: 1,
    installClass: 'url',
    deeplinkKind: null,
    // The one client where "Connect" is the real button label. Owners add the
    // connector once for the whole organization; members then authenticate.
    afterInstall: 'Add the connector, then click Connect to sign in.',
    authOwner: 'host',
    connectLabel: 'Connect',
    pluginSupport: true,
    markKey: 'anthropic',
    docsUrl: 'https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors'
  },
  {
    id: 'devin',
    label: 'Devin',
    kind: 'desktop',
    tier: 1,
    installClass: 'plugin',
    deeplinkKind: null,
    // Devin renders a real Connect button after the custom MCP is added.
    afterInstall: 'Add the MCP, then click Connect to sign in.',
    authOwner: 'host',
    connectLabel: 'Connect',
    pluginSupport: true,
    markKey: 'devin',
    docsUrl: 'https://docs.devin.ai/work-with-devin/mcp'
  },
  {
    id: 'codex',
    label: 'Codex',
    kind: 'cli',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    // No Connect button: the client's own login subcommand owns the sign-in.
    afterInstall: 'Then run codex mcp login proofable.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'codex',
    docsUrl: 'https://developers.openai.com/codex/mcp'
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    kind: 'web',
    tier: 2,
    installClass: 'url',
    deeplinkKind: null,
    afterInstall: 'Turn on developer mode, add the connection, and sign in when ChatGPT asks.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'openai',
    docsUrl: 'https://developers.openai.com/plugins/deploy/connect-chatgpt'
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    kind: 'cli',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    afterInstall: 'Then run /mcp auth proofable.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: false,
    markKey: 'gemini',
    docsUrl: 'https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md'
  },
  {
    id: 'antigravity',
    label: 'Antigravity',
    kind: 'desktop',
    tier: 2,
    installClass: 'plugin',
    deeplinkKind: null,
    afterInstall: 'Then sign in when Antigravity asks.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'antigravity',
    docsUrl: 'https://antigravity.google/docs/mcp'
  },
  {
    id: 'warp',
    label: 'Warp',
    kind: 'terminal',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    afterInstall: 'Start it and Warp opens the sign-in.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'warp',
    docsUrl: 'https://docs.warp.dev/knowledge-and-collaboration/mcp'
  },
  {
    id: 'zed',
    label: 'Zed',
    kind: 'ide',
    tier: 2,
    installClass: 'url',
    deeplinkKind: null,
    afterInstall: 'Add it as a remote server, then sign in when Zed prompts you.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: false,
    markKey: 'zed',
    docsUrl: 'https://zed.dev/docs/assistant/model-context-protocol'
  },
  {
    id: 'openclaw',
    label: 'OpenClaw',
    kind: 'cli',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    afterInstall: 'Then run openclaw mcp login proofable.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'openclaw',
    docsUrl: 'https://docs.openclaw.ai/tools/mcp'
  },
  {
    id: 'hermes',
    label: 'Hermes',
    kind: 'cli',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    afterInstall: 'Then run hermes mcp login proofable.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: true,
    markKey: 'hermes',
    docsUrl: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp'
  },
  {
    id: 'n8n',
    label: 'n8n',
    kind: 'automation',
    tier: 2,
    installClass: 'url',
    deeplinkKind: null,
    afterInstall: 'Use the MCP Client node with OAuth2 and dynamic client registration on.',
    authOwner: 'host',
    connectLabel: null,
    pluginSupport: false,
    markKey: 'n8n',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/credentials/mcp/'
  },
  {
    id: 'cline',
    label: 'Cline',
    kind: 'ide',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    // Cline documents no browser sign-in: an access-key header is the honest path.
    afterInstall: 'Cline needs an access key header; it has no browser sign-in.',
    authOwner: 'manual',
    connectLabel: null,
    pluginSupport: false,
    markKey: 'cline',
    docsUrl: 'https://docs.cline.bot/mcp/connecting-to-a-remote-server'
  },
  {
    id: 'jetbrains',
    label: 'JetBrains IDEs',
    kind: 'ide',
    tier: 2,
    installClass: 'command',
    deeplinkKind: null,
    // No documented MCP OAuth in JetBrains docs: do not promise a sign-in.
    afterInstall: 'No documented sign-in yet; use an access key header.',
    authOwner: 'manual',
    connectLabel: null,
    pluginSupport: false,
    markKey: 'jetbrains',
    docsUrl: 'https://www.jetbrains.com/help/ai-assistant/mcp.html'
  }
];

/** Clients shown as first-class on the install surface. */
export const MCP_PRIMARY_CLIENT_IDS = MCP_INSTALL_PATHS
  .filter((entry) => entry.tier === 1)
  .map((entry) => entry.id);

/** Everything else, for the long-tail list. */
export const MCP_SECONDARY_CLIENT_IDS = MCP_INSTALL_PATHS
  .filter((entry) => entry.tier === 2)
  .map((entry) => entry.id);

/** Look up one client's install path. */
export function mcpInstallPath(id) {
  const key = String(id || '').trim();
  return MCP_INSTALL_PATHS.find((entry) => entry.id === key) || null;
}

/**
 * True when the client really renders a "Connect" control.
 * Callers that want to name a control must ask this first, so the old
 * "Click Connect" copy cannot come back by habit.
 */
export function mcpClientHasConnectButton(id) {
  return Boolean(mcpInstallPath(id)?.connectLabel);
}

/**
 * True when a browser sign-in is the honest interactive path.
 * False means an access key is the only documented route.
 */
export function mcpClientSignsInInBrowser(id) {
  return mcpInstallPath(id)?.authOwner === 'host';
}

/**
 * The honest next-step sentence for a client, safe to render verbatim.
 * Falls back to the generic any-client instruction for an unknown id rather
 * than inventing a host-specific step.
 */
export function mcpAfterInstallCopy(id) {
  const entry = mcpInstallPath(id);
  if (entry) return entry.afterInstall;
  return 'Then complete the sign-in your client opens.';
}
