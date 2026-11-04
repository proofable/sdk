import { ValidationError, ApiError, NetworkError } from './errors.js';

/**
 * A short-lived grant that bills your app's usage to the app's owner: checks its users run
 * (`sponsored-verification`, the default) or chats its users have with the owner's agents
 * (`agent-chat`). The owner turns sponsorship on once with `client.sponsorApp()` or
 * `proofable sponsor`. A grant is accepted once; fetch one per call that carries it.
 */
export async function fetchSponsorGrant(params = {}) {
  const {
    apiUrl = 'https://api.proofable.me',
    appId,
    orgWallet,
    verifierIds = [],
    targetChains = [],
    origin,
    scope = 'sponsored-verification',
    expiresInSeconds = 900,
    fetchImpl = fetch
  } = params;
  const normalizedScope = scope === 'agent-chat' ? 'agent-chat' : 'sponsored-verification';

  const normalizedAppId = typeof appId === 'string' ? appId.trim() : '';
  const normalizedOrg = typeof orgWallet === 'string' ? orgWallet.trim().toLowerCase() : '';
  if (!normalizedAppId) {
    throw new ValidationError('appId is required for sponsor grant');
  }
  if (!normalizedOrg || !/^0x[a-f0-9]{40}$/.test(normalizedOrg)) {
    throw new ValidationError('orgWallet must be a valid EVM address');
  }

  let base = String(apiUrl || 'https://api.proofable.me').replace(/\/+$/, '');
  try {
    const url = new URL(base);
    if (url.hostname.endsWith('proofable.me') && url.protocol === 'http:') {
      url.protocol = 'https:';
    }
    base = url.toString().replace(/\/+$/, '');
  } catch {
    void 0;
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Neus-App': normalizedAppId,
    'X-Neus-Sdk': 'js'
  };
  if (typeof origin === 'string' && origin.trim()) {
    // Both: a runtime that will not send Origin still names the app's origin.
    headers.Origin = origin.trim();
    headers['X-Client-Origin'] = origin.trim();
  }

  const body = {
    orgWallet: normalizedOrg,
    scope: normalizedScope,
    expiresInSeconds,
    ...(Array.isArray(verifierIds) && verifierIds.length > 0
      ? { verifierIds: verifierIds.map((v) => String(v).trim()).filter(Boolean).slice(0, 25) }
      : {}),
    ...(Array.isArray(targetChains) && targetChains.length > 0
      ? { targetChains: targetChains.filter((n) => Number.isFinite(Number(n))).slice(0, 25) }
      : {})
  };

  let response;
  try {
    response = await fetchImpl(`${base}/api/v1/sponsor/grant`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw new NetworkError(`Sponsor grant request failed: ${error?.message || String(error)}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, error: { message: 'Invalid JSON response' } };
  }

  if (!response.ok || payload?.success !== true) {
    throw ApiError.fromResponse(response, payload);
  }

  const token = payload?.data?.sponsorGrant;
  if (!token || typeof token !== 'string') {
    throw new ApiError('Sponsor grant response missing sponsorGrant token', payload?.error);
  }

  return {
    sponsorGrant: token,
    exp: payload?.data?.exp,
    orgWallet: payload?.data?.orgWallet || normalizedOrg,
    appId: payload?.data?.appId || normalizedAppId,
    maxCredits: payload?.data?.maxCredits
  };
}
