/**
 * Sign your app's users in with Proofable.
 *
 * The same sign-in every MCP host uses (OAuth 2.0 authorization code with PKCE, RFC 7591
 * client registration, RFC 8707 resource), for your own web app. Register your callback once,
 * send the person to Proofable, exchange the code for their access token, then act as them
 * with `new ProofableClient({ apiKey: tokens.accessToken })`. Runs wherever `fetch` and Web
 * Crypto exist: Node 20+, Deno, edge runtimes and browsers.
 */
import { ApiError, NetworkError, ValidationError } from './errors.js';

export const PROOFABLE_SIGN_IN_ISSUER = 'https://proofable.me';
export const PROOFABLE_SIGN_IN_RESOURCE = 'https://mcp.proofable.me/mcp';
// What an app's sign-in asks for: the person's profile and records, and a refresh token. Never
// their vault; an app that needs it asks for `proofable:secrets` on purpose.
export const PROOFABLE_SIGN_IN_SCOPE = 'proofable:core proofable:profile offline_access';

const CLIENT_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;

function webCrypto() {
  const c = globalThis.crypto;
  if (!c || typeof c.getRandomValues !== 'function' || !c.subtle) {
    throw new NetworkError('Web Crypto is not available in this runtime.');
  }
  return c;
}

function base64Url(bytes) {
  let text = '';
  for (const byte of new Uint8Array(bytes)) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomToken(size = 32) {
  return base64Url(webCrypto().getRandomValues(new Uint8Array(size)));
}

async function pkceChallenge(verifier) {
  const digest = await webCrypto().subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64Url(digest);
}

function normalizeTokens(json) {
  const expiresIn = Number(json?.expires_in);
  return {
    accessToken: String(json?.access_token || ''),
    refreshToken: json?.refresh_token ? String(json.refresh_token) : null,
    tokenType: String(json?.token_type || 'Bearer'),
    expiresIn: Number.isFinite(expiresIn) ? expiresIn : null,
    expiresAt: Number.isFinite(expiresIn) ? Date.now() + expiresIn * 1000 : null,
    scope: String(json?.scope || '')
  };
}

export class ProofableSignIn {
  /**
   * @param {object} options
   * @param {string} options.redirectUri   where Proofable sends the person back, an https URL on your site
   * @param {string} [options.clientId]    the client id `register()` gave you; omit it and `start()` registers once per instance
   * @param {string} [options.scope]       defaults to the person's profile and records with a refresh token; add `proofable:secrets` only if your app needs their vault
   * @param {string} [options.issuer]      defaults to https://proofable.me
   * @param {string} [options.resource]    defaults to the Proofable resource every token names
   * @param {typeof fetch} [options.fetchImpl]
   */
  constructor(options = {}) {
    const redirectUri = String(options.redirectUri || '').trim();
    let parsed;
    try {
      parsed = new URL(redirectUri);
    } catch {
      parsed = null;
    }
    if (!parsed || parsed.protocol !== 'https:') {
      throw new ValidationError('redirectUri must be an https URL on your site', 'redirectUri', options.redirectUri);
    }
    this.redirectUri = redirectUri;
    this.clientId = options.clientId ? String(options.clientId).trim() : null;
    if (this.clientId && !CLIENT_ID_PATTERN.test(this.clientId)) {
      throw new ValidationError('clientId is not a client id Proofable issued', 'clientId', options.clientId);
    }
    this.issuer = String(options.issuer || PROOFABLE_SIGN_IN_ISSUER).replace(/\/$/, '');
    this.resource = String(options.resource || PROOFABLE_SIGN_IN_RESOURCE);
    this.scope = String(options.scope || PROOFABLE_SIGN_IN_SCOPE);
    this._fetch = typeof options.fetchImpl === 'function' ? options.fetchImpl : (...args) => fetch(...args);
  }

  async _post(path, body, { form = false } = {}) {
    let response;
    try {
      response = await this._fetch(`${this.issuer}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json',
          Accept: 'application/json'
        },
        body: form ? new URLSearchParams(body).toString() : JSON.stringify(body)
      });
    } catch (error) {
      throw new NetworkError(`Network error: ${error.message}`);
    }
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(
        json?.error_description || json?.error || `Proofable sign-in failed with status ${response.status}`,
        response.status,
        String(json?.error || 'SIGN_IN_ERROR').toUpperCase(),
        json
      );
    }
    return json;
  }

  /**
   * Register your callback with Proofable. Do this once and keep the client id it returns;
   * `start()` calls it for you when the instance has none.
   * @returns {Promise<string>} the client id
   */
  async register() {
    const json = await this._post('/oauth/register', { redirect_uris: [this.redirectUri] });
    const clientId = String(json?.client_id || '').trim();
    if (!CLIENT_ID_PATTERN.test(clientId)) {
      throw new ApiError('Proofable did not return a client id', 502, 'SIGN_IN_ERROR', json);
    }
    this.clientId = clientId;
    return clientId;
  }

  /**
   * Where to send the person. Keep `verifier` and `state` until they come back (a signed,
   * short-lived cookie is the usual place), then pass both to `finish()`.
   * @param {object} [options]
   * @param {string} [options.state]  your own value for this attempt; generated when omitted
   * @returns {Promise<{ url: string, state: string, verifier: string, clientId: string }>}
   */
  async start(options = {}) {
    if (!this.clientId) await this.register();
    const state = String(options.state || '').trim() || randomToken(16);
    const verifier = randomToken(32);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code_challenge: await pkceChallenge(verifier),
      code_challenge_method: 'S256',
      state,
      scope: this.scope,
      resource: this.resource
    });
    return { url: `${this.issuer}/oauth/authorize?${params.toString()}`, state, verifier, clientId: this.clientId };
  }

  /**
   * The person is back: exchange the code for their tokens. Refuses a callback whose `state`
   * is not the one you started, or whose issuer is not Proofable.
   * @param {object} input
   * @param {string} input.code           `code` from the callback URL
   * @param {string} input.verifier       from `start()`
   * @param {string} [input.state]        `state` from the callback URL
   * @param {string} [input.expectedState] the `state` from `start()`
   * @param {string} [input.iss]          `iss` from the callback URL, when present
   * @returns {Promise<{ accessToken: string, refreshToken: string|null, tokenType: string, expiresIn: number|null, expiresAt: number|null, scope: string }>}
   */
  async finish(input = {}) {
    const code = String(input.code || '').trim();
    const verifier = String(input.verifier || '').trim();
    if (!code) throw new ValidationError('code is required', 'code', input.code);
    if (!verifier) throw new ValidationError('verifier is required', 'verifier', input.verifier);
    if (input.expectedState !== undefined && input.expectedState !== null && String(input.state || '') !== String(input.expectedState)) {
      throw new ValidationError('state does not match the sign-in you started', 'state', input.state);
    }
    if (input.iss !== undefined && input.iss !== null && String(input.iss).replace(/\/$/, '') !== this.issuer) {
      throw new ValidationError('the callback did not come from Proofable', 'iss', input.iss);
    }
    if (!this.clientId) throw new ValidationError('clientId is required to finish a sign-in', 'clientId', null);
    const json = await this._post('/api/v1/auth/mcp/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: verifier,
      resource: this.resource
    }, { form: true });
    const tokens = normalizeTokens(json);
    if (!tokens.accessToken) throw new ApiError('Proofable did not return an access token', 502, 'SIGN_IN_ERROR', json);
    return tokens;
  }

  /**
   * New tokens from a refresh token. The old refresh token is spent; keep the new one.
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    const token = String(refreshToken || '').trim();
    if (!token) throw new ValidationError('refreshToken is required', 'refreshToken', refreshToken);
    if (!this.clientId) throw new ValidationError('clientId is required to refresh a sign-in', 'clientId', null);
    const json = await this._post('/api/v1/auth/mcp/token', {
      grant_type: 'refresh_token',
      refresh_token: token,
      client_id: this.clientId,
      resource: this.resource
    }, { form: true });
    const tokens = normalizeTokens(json);
    if (!tokens.accessToken) throw new ApiError('Proofable did not return an access token', 502, 'SIGN_IN_ERROR', json);
    return tokens;
  }
}
