import { describe, expect, it } from 'vitest';
import {
  MCP_INSTALL_HOSTS,
  PROOFABLE_MCP_URL,
  buildAuthCommandForClient,
  buildCursorMcpConfig,
  buildCursorMcpInstallHref,
  buildMcpHttpConfig,
  buildSetupCliCommandForHost,
  buildSetupCommandForClient,
  buildSetupCommandForHost,
  buildVsCodeMcpConfig
} from '../mcp-hosts.js';

describe('mcp-hosts', () => {
  it('lists product install hosts', () => {
    expect(MCP_INSTALL_HOSTS).toEqual(['cursor', 'claude', 'codex', 'vscode']);
  });

  it('builds Proofable HTTP MCP config', () => {
    expect(buildMcpHttpConfig()).toEqual({
      type: 'http',
      url: PROOFABLE_MCP_URL
    });
    expect(buildMcpHttpConfig('npk_test')).toEqual({
      type: 'http',
      url: PROOFABLE_MCP_URL,
      headers: { Authorization: 'Bearer npk_test' }
    });
  });

  it('builds Cursor-native MCP config without type field', () => {
    expect(buildCursorMcpConfig()).toEqual({
      url: PROOFABLE_MCP_URL
    });
    expect(buildCursorMcpConfig('npk_test')).toEqual({
      url: PROOFABLE_MCP_URL,
      headers: { Authorization: 'Bearer npk_test' }
    });
    // OAuth JWT tokens must not be written as a static header.
    expect(buildCursorMcpConfig('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3AM9Hz8bpA5G2Fw')).toEqual({
      url: PROOFABLE_MCP_URL
    });
  });

  it('builds VS Code MCP config with type field', () => {
    expect(buildVsCodeMcpConfig()).toEqual({
      type: 'http',
      url: PROOFABLE_MCP_URL
    });
    expect(buildVsCodeMcpConfig('npk_test')).toEqual({
      type: 'http',
      url: PROOFABLE_MCP_URL,
      headers: { Authorization: 'Bearer npk_test' }
    });
  });

  it('builds setup commands per client', () => {
    expect(buildSetupCommandForClient('cursor')).toContain('--client cursor');
    expect(buildSetupCommandForClient('codex')).toContain('--client codex');
    expect(buildSetupCommandForClient('vscode')).toContain('--client vscode');
    expect(buildSetupCommandForClient('claude')).toContain('--client claude');
    expect(buildSetupCommandForClient('codex', 'npk_x')).toBe(
      'npx -y @proofable/sdk setup --client codex --access-key npk_x'
    );
  });

  it('builds Codex-specific auth command and host-connect setup for Cursor', () => {
    expect(buildAuthCommandForClient('codex')).toContain('--client codex');
    expect(buildAuthCommandForClient('cursor')).toContain('@proofable/sdk setup');
    expect(buildAuthCommandForClient('cursor')).not.toContain('proofable auth');
  });

  it('maps product hosts to CLI clients', () => {
    expect(buildSetupCommandForHost('codex')).toContain('--client codex');
    expect(buildSetupCommandForHost('codex')).toBe(
      'npx -y @proofable/sdk setup --client codex'
    );
  });

  it('builds public CLI setup commands without npx', () => {
    expect(buildSetupCliCommandForHost('cursor')).toBe('proofable setup --client cursor');
    expect(buildSetupCliCommandForHost('codex')).toBe('proofable setup --client codex');
    expect(buildSetupCliCommandForHost('codex', 'npk_x')).toBe(
      'proofable setup --client codex --access-key npk_x'
    );
    expect(buildSetupCliCommandForHost('cursor')).not.toContain('npx');
  });

  it('builds Cursor install links with transport-only config', () => {
    const href = buildCursorMcpInstallHref();
    expect(href.startsWith('cursor://anysphere.cursor-deeplink/mcp/install?name=proofable&config=')).toBe(
      true
    );
    const encoded = href.split('config=')[1];
    const json = Buffer.from(decodeURIComponent(encoded), 'base64').toString('utf8');
    expect(JSON.parse(json)).toEqual({ url: PROOFABLE_MCP_URL });
  });
});
