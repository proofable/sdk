import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ProofableClient } from '../client.js';
import { signMessage } from '../utils.js';

global.fetch = vi.fn();

const repoRoot = path.resolve(__dirname, '..');

describe('eth_sign is never used (security regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('client.verify() fails closed when personal_sign is unsupported — never falls back to eth_sign', async () => {
    const calls = [];
    const wallet = {
      address: '0x742d35Cc6634C0532925a3b8D82AB78c0D73C3Db',
      request: async ({ method, params }) => {
        calls.push({ method, params });
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
          return ['0x742d35Cc6634C0532925a3b8D82AB78c0D73C3Db'];
        }
        if (method === 'personal_sign') {
          const err = new Error('The method personal_sign is not supported.');
          err.code = 4200;
          throw err;
        }
        throw new Error(`Unexpected method called: ${method}`);
      },
    };

    const client = new ProofableClient({ enableLogging: false });

    await expect(
      client.verify({ verifier: 'ownership-basic', content: 'regression-fixture', wallet })
    ).rejects.toThrow(/does not support personal_sign/);

    // The provider must never have been asked to eth_sign.
    expect(calls.some((c) => c.method === 'eth_sign')).toBe(false);
  });

  it('client.verify() still succeeds via personal_sign for compliant wallets', async () => {
    const calls = [];
    const wallet = {
      address: '0x742d35Cc6634C0532925a3b8D82AB78c0D73C3Db',
      request: async ({ method }) => {
        calls.push({ method });
        if (method === 'personal_sign') return `0x${'ab'.repeat(65)}`;
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
          return ['0x742d35Cc6634C0532925a3b8D82AB78c0D73C3Db'];
        }
        throw new Error(`Unexpected method called: ${method}`);
      },
    };

    // verify() may first fetch the verifier catalog; make every fetch respond
    // with a successful verify result so the flow completes deterministically.
    fetch.mockImplementation(async () => ({
      ok: true,
      json: async () => ({ success: true, data: { status: 'verified', qHash: `0x${'cd'.repeat(32)}` } }),
    }));

    const client = new ProofableClient({ enableLogging: false });
    const result = await client.verify({ verifier: 'ownership-basic', content: 'regression-fixture', wallet });
    expect(result).toBeTruthy();
    expect(calls.some((c) => c.method === 'personal_sign')).toBe(true);
    expect(calls.some((c) => c.method === 'eth_sign')).toBe(false);
  });

  it('signMessage() never falls back to eth_sign when personal_sign fails', async () => {
    const calls = [];
    const provider = {
      request: async ({ method }) => {
        calls.push({ method });
        if (method === 'eth_accounts') return ['0x742d35Cc6634C0532925a3b8D82AB78c0D73C3Db'];
        if (method === 'personal_sign') {
          throw new Error('signing rejected by user');
        }
        throw new Error(`Unexpected method called: ${method}`);
      },
    };

    await expect(
      signMessage({
        provider,
        walletAddress: '0x742d35Cc6634C0532925a3b8D82AB78c0D73C3Db',
        message: 'test message',
      })
    ).rejects.toThrow();
    expect(calls.some((c) => c.method === 'eth_sign')).toBe(false);
  });

  it('no SDK source path may request eth_sign', () => {
    for (const file of ['client.js', 'utils.js', 'index.js', 'gates.js', 'runtime-mount.js', 'runtime-adapters.js']) {
      const p = path.join(repoRoot, file);
      if (!fs.existsSync(p)) continue;
      const source = fs.readFileSync(p, 'utf8');
      expect(source, `${file} must not request eth_sign`).not.toMatch(/method:\s*['"]eth_sign['"]/);
      expect(source, `${file} must not reference the eth_sign escape hatch`).not.toContain('__PROOFABLE_ALLOW_ETH_SIGN__');
    }
  });
});