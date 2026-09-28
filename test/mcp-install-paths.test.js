import { describe, expect, it } from 'vitest';

import {
  MCP_AUTH_OWNERS,
  MCP_INSTALL_CLASSES,
  MCP_INSTALL_PATHS,
  MCP_PRIMARY_CLIENT_IDS,
  MCP_SECONDARY_CLIENT_IDS,
  mcpAfterInstallCopy,
  mcpClientHasConnectButton,
  mcpClientSignsInInBrowser,
  mcpInstallPath
} from '../mcp-install-paths.js';
import { buildCursorMcpInstallHref, buildVsCodeMcpInstallHref } from '../mcp-hosts.js';

/**
 * The regression this file locks out.
 *
 * Every client used to be handed the same sentence — "Click Connect and sign
 * in" — in the product page, the Connect menus, the CLI hint and five READMEs.
 * Only two clients render a control by that name. For Cursor, VS Code, Claude
 * Code and Codex the user went looking for a button that does not exist.
 */
const FORBIDDEN_CONTROL_CLAIM = /click\s+(\*\*)?connect/i;

describe('MCP install-path truth table', () => {
  it('gives every entry a valid class, auth owner and vendor doc link', () => {
    expect(MCP_INSTALL_PATHS.length).toBeGreaterThan(0);
    for (const entry of MCP_INSTALL_PATHS) {
      expect(MCP_INSTALL_CLASSES, entry.id).toContain(entry.installClass);
      expect(MCP_AUTH_OWNERS, entry.id).toContain(entry.authOwner);
      expect(entry.label, entry.id).toBeTruthy();
      expect(entry.afterInstall, entry.id).toBeTruthy();
      expect(entry.docsUrl, entry.id).toMatch(/^https:\/\//);
      expect(entry.tier === 1 || entry.tier === 2, entry.id).toBe(true);
    }
  });

  it('never names a Connect control unless the client really renders one', () => {
    // "Connect" is the literal button label only in Claude connectors and Devin.
    const withButton = MCP_INSTALL_PATHS.filter((entry) => entry.connectLabel !== null);
    expect(withButton.map((entry) => entry.id).sort()).toEqual(['claude-connectors', 'devin']);

    for (const entry of MCP_INSTALL_PATHS) {
      expect(mcpClientHasConnectButton(entry.id), entry.id).toBe(entry.connectLabel !== null);
    }
  });

  it('does not tell a client without a Connect button to click Connect', () => {
    for (const entry of MCP_INSTALL_PATHS) {
      if (mcpClientHasConnectButton(entry.id)) continue;
      expect(entry.afterInstall, entry.id).not.toMatch(FORBIDDEN_CONTROL_CLAIM);
    }
  });

  it('only claims a browser sign-in where the client actually runs one', () => {
    // Manual-key clients document no OAuth; promising a sign-in would be the
    // same class of lie as the Connect copy.
    const manual = MCP_INSTALL_PATHS.filter((entry) => entry.authOwner === 'manual');
    expect(manual.map((entry) => entry.id).sort()).toEqual(['cline', 'jetbrains']);

    for (const entry of manual) {
      expect(mcpClientSignsInInBrowser(entry.id), entry.id).toBe(false);
      expect(entry.afterInstall, entry.id).toMatch(/access key/i);
    }
  });

  it('backs every deeplink entry with a real builder', () => {
    const deeplink = MCP_INSTALL_PATHS.filter((entry) => entry.installClass === 'deeplink');
    expect(deeplink.length).toBe(2);
    for (const entry of deeplink) {
      expect(entry.deeplinkKind, entry.id).toBeTruthy();
    }
    expect(buildCursorMcpInstallHref().startsWith('cursor://')).toBe(true);
    expect(buildVsCodeMcpInstallHref().startsWith('vscode:mcp/install?')).toBe(true);
  });

  it('splits first-class clients from the long tail without dropping any', () => {
    expect(MCP_PRIMARY_CLIENT_IDS).toEqual([
      'cursor',
      'vscode',
      'claude-code',
      'claude-connectors',
      'devin'
    ]);
    expect(MCP_PRIMARY_CLIENT_IDS.length + MCP_SECONDARY_CLIENT_IDS.length).toBe(
      MCP_INSTALL_PATHS.length
    );
    // Codex has no deeplink and no Connect button, so it is long-tail, not
    // first-class. This is the swap decision, locked.
    expect(MCP_SECONDARY_CLIENT_IDS).toContain('codex');
    expect(MCP_PRIMARY_CLIENT_IDS).not.toContain('codex');
  });

  it('falls back to generic wording for an unknown client instead of inventing a step', () => {
    const copy = mcpAfterInstallCopy('something-that-does-not-exist');
    expect(copy).not.toMatch(FORBIDDEN_CONTROL_CLAIM);
    expect(copy).toMatch(/sign-in/i);
    expect(mcpInstallPath('')).toBeNull();
    expect(mcpInstallPath('nope')).toBeNull();
    expect(mcpClientHasConnectButton('nope')).toBe(false);
  });
});
