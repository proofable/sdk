import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchSponsorGrant } from '../sponsor.js';
import { ProofableClient } from '../client.js';
import { ValidationError, ApiError, NetworkError } from '../errors.js';

describe('ProofableClient.sponsorApp', () => {
  afterEach(() => vi.restoreAllMocks());

  it('records, as the signed-in account, that the app may pay for its users\' checks and chats', async () => {
    const OWNER = `0x${'3'.repeat(40)}`;
    const ISSUER = `0x${'9'.repeat(40)}`;
    const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    const fetch = vi.fn(async (url) => {
      const u = String(url);
      if (u.endsWith('/api/v1/sponsor/issuer-address')) return json({ success: true, issuerAddress: ISSUER });
      if (u.endsWith('/api/v1/auth/me')) return json({ success: true, data: { authenticated: true, primaryAccount: OWNER } });
      if (u.endsWith('/api/v1/verification')) return json({ success: true, data: { qHash: `0x${'a'.repeat(64)}`, status: 'verified' } });
      throw new Error(`unexpected ${u}`);
    });
    vi.stubGlobal('fetch', fetch);
    const client = new ProofableClient({ apiKey: 'npk_owner' });
    const result = await client.sponsorApp({ appId: 'everyone', origin: 'https://everyone.team/', creditsPerDay: 2000 });
    expect(result).toEqual({ qHash: `0x${'a'.repeat(64)}`, appId: 'everyone', origin: 'https://everyone.team', creditsPerDay: 2000, scopes: ['sponsored-verification', 'agent-chat'] });
    const record = fetch.mock.calls.find(([u]) => String(u).endsWith('/api/v1/verification'));
    expect(JSON.parse(record[1].body)).toMatchObject({
      walletAddress: OWNER,
      verifierIds: ['agent-delegation'],
      data: {
        controllerWallet: OWNER,
        agentWallet: ISSUER,
        scope: 'sponsor-grants',
        allowedActions: ['read_context'],
        permissions: ['app:everyone', 'origin:https://everyone.team', 'cap:creditsPerDay=2000', 'scopes:sponsored-verification,agent-chat']
      },
      options: { privacyLevel: 'private' }
    });
    vi.unstubAllGlobals();
  });

  it('refuses an app id, origin or cap it cannot record', async () => {
    const client = new ProofableClient({ apiKey: 'npk_owner' });
    await expect(client.sponsorApp({ appId: 'has space', origin: 'https://x.app', creditsPerDay: 1 })).rejects.toThrow(ValidationError);
    await expect(client.sponsorApp({ appId: 'ok', origin: 'http://x.app', creditsPerDay: 1 })).rejects.toThrow(ValidationError);
    await expect(client.sponsorApp({ appId: 'ok', origin: 'https://x.app', creditsPerDay: 0 })).rejects.toThrow(ValidationError);
    await expect(client.sponsorApp({ appId: 'ok', origin: 'https://x.app', creditsPerDay: 5, scopes: ['everything'] })).rejects.toThrow(ValidationError);
  });
});

global.fetch = vi.fn();

describe('fetchSponsorGrant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires appId and orgWallet', async () => {
    await expect(fetchSponsorGrant({ orgWallet: '0x1234567890123456789012345678901234567890' }))
      .rejects.toThrow(ValidationError);
    await expect(fetchSponsorGrant({ appId: 'my-app' }))
      .rejects.toThrow(ValidationError);
  });

  it('posts sponsor grant request with integrator headers', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            sponsorGrant: 'grant-token-abc',
            exp: 1_700_000_000,
            orgWallet: '0x1234567890123456789012345678901234567890',
            appId: 'my-app'
          }
        })
    });

    const result = await fetchSponsorGrant({
      appId: 'my-app',
      orgWallet: '0x1234567890123456789012345678901234567890',
      verifierIds: ['ownership-basic'],
      origin: 'https://app.example'
    });

    expect(result.sponsorGrant).toBe('grant-token-abc');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.proofable.me/api/v1/sponsor/grant');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Neus-App']).toBe('my-app');
    expect(init.headers.Origin).toBe('https://app.example');
    const body = JSON.parse(init.body);
    expect(body.orgWallet).toBe('0x1234567890123456789012345678901234567890');
    expect(body.verifierIds).toEqual(['ownership-basic']);
  });

  it('throws ApiError on upstream failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({
          success: false,
          error: { message: 'Origin not authorized' }
        })
    });

    await expect(
      fetchSponsorGrant({
        appId: 'my-app',
        orgWallet: '0x1234567890123456789012345678901234567890'
      })
    ).rejects.toThrow(ApiError);
  });

  it('wraps network failures', async () => {
    fetch.mockRejectedValueOnce(new Error('offline'));

    await expect(
      fetchSponsorGrant({
        appId: 'my-app',
        orgWallet: '0x1234567890123456789012345678901234567890'
      })
    ).rejects.toThrow(NetworkError);
  });
});
