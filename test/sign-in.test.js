import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProofableSignIn } from '../sign-in.js';
import { ApiError, ValidationError } from '../errors.js';

const REDIRECT = 'https://everyone.team/rooms/agent/callback';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('ProofableSignIn', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('needs an https callback on your site', () => {
    expect(() => new ProofableSignIn({ redirectUri: 'http://everyone.team/cb' })).toThrow(ValidationError);
    expect(() => new ProofableSignIn({})).toThrow(ValidationError);
  });

  it('registers the callback once, then sends the person to Proofable with PKCE', async () => {
    const fetch = vi.fn(async (url) => {
      if (String(url).endsWith('/oauth/register')) return json({ client_id: 'mcp_0123abcd', redirect_uris: [REDIRECT] }, 201);
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal('fetch', fetch);

    const signIn = new ProofableSignIn({ redirectUri: REDIRECT });
    const first = await signIn.start({ state: 'attempt-1' });
    const second = await signIn.start();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ redirect_uris: [REDIRECT] });
    expect(first.clientId).toBe('mcp_0123abcd');
    const url = new URL(first.url);
    expect(`${url.origin}${url.pathname}`).toBe('https://proofable.me/oauth/authorize');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      response_type: 'code',
      client_id: 'mcp_0123abcd',
      redirect_uri: REDIRECT,
      code_challenge_method: 'S256',
      state: 'attempt-1',
      scope: 'proofable:core proofable:profile offline_access',
      resource: 'https://mcp.proofable.me/mcp'
    });
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    // Each attempt gets its own verifier and state.
    expect(second.verifier).not.toBe(first.verifier);
    expect(second.state).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it('exchanges the code for the person\'s tokens, and refuses a callback that is not the one it started', async () => {
    const fetch = vi.fn(async () => json({ access_token: 'at-1', refresh_token: 'rt-1', token_type: 'Bearer', expires_in: 86400, scope: 'proofable:core' }));
    vi.stubGlobal('fetch', fetch);
    const signIn = new ProofableSignIn({ redirectUri: REDIRECT, clientId: 'mcp_0123abcd' });

    await expect(signIn.finish({ code: 'c', verifier: 'v', state: 'other', expectedState: 'mine' })).rejects.toThrow(ValidationError);
    await expect(signIn.finish({ code: 'c', verifier: 'v', iss: 'https://evil.example' })).rejects.toThrow(ValidationError);
    expect(fetch).not.toHaveBeenCalled();

    const tokens = await signIn.finish({ code: 'c', verifier: 'v', state: 'mine', expectedState: 'mine', iss: 'https://proofable.me' });
    expect(tokens).toMatchObject({ accessToken: 'at-1', refreshToken: 'rt-1', tokenType: 'Bearer', expiresIn: 86400, scope: 'proofable:core' });
    expect(tokens.expiresAt).toBeGreaterThan(Date.now());
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://proofable.me/api/v1/auth/mcp/token');
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(Object.fromEntries(new URLSearchParams(init.body))).toEqual({
      grant_type: 'authorization_code',
      code: 'c',
      redirect_uri: REDIRECT,
      client_id: 'mcp_0123abcd',
      code_verifier: 'v',
      resource: 'https://mcp.proofable.me/mcp'
    });
  });

  it('refreshes with the client id and surfaces a refusal as an ApiError', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(json({ access_token: 'at-2', refresh_token: 'rt-2', expires_in: 86400 }))
      .mockResolvedValueOnce(json({ error: 'invalid_grant', error_description: 'refresh token expired' }, 400));
    vi.stubGlobal('fetch', fetch);
    const signIn = new ProofableSignIn({ redirectUri: REDIRECT, clientId: 'mcp_0123abcd' });

    const tokens = await signIn.refresh('rt-1');
    expect(tokens).toMatchObject({ accessToken: 'at-2', refreshToken: 'rt-2' });
    expect(Object.fromEntries(new URLSearchParams(fetch.mock.calls[0][1].body))).toEqual({
      grant_type: 'refresh_token', refresh_token: 'rt-1', client_id: 'mcp_0123abcd', resource: 'https://mcp.proofable.me/mcp'
    });

    const error = await signIn.refresh('rt-2').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ statusCode: 400, code: 'INVALID_GRANT', message: 'refresh token expired' });
  });
});
