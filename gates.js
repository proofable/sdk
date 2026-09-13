// SPDX-License-Identifier: Apache-2.0

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;

export const GATE_NFT_HOLDER = [{ verifierId: 'nft-ownership' }];

export const GATE_TOKEN_HOLDER = [{ verifierId: 'token-holding' }];

export const GATE_CONTRACT_ADMIN = [{ verifierId: 'contract-ownership', maxAgeMs: HOUR }];

export const GATE_DOMAIN_OWNER = [{ verifierId: 'ownership-dns-txt' }];

export const GATE_LINKED_WALLETS = [{ verifierId: 'wallet-link' }];

export const GATE_AGENT_IDENTITY = [{ verifierId: 'agent-identity' }];

export const GATE_AGENT_DELEGATION = [{ verifierId: 'agent-delegation', maxAgeMs: 7 * DAY }];

export const GATE_CONTENT_MODERATION = [{ verifierId: 'ai-content-moderation' }];

export const GATE_WALLET_RISK = [{ verifierId: 'wallet-risk' }];

export const GATE_PSEUDONYM = [{ verifierId: 'ownership-pseudonym' }];

export function sanitizeGateRequirements(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 32)
    .map((req) => {
      const verifierId = String(req?.verifierId || req?.type || (typeof req === 'string' ? req : ''))
        .trim()
        .toLowerCase()
        .slice(0, 80);
      const optional = Boolean(req?.optional);
      const minCount = Math.max(1, Number(req?.minCount || 1) || 1);
      const maxAgeMs = Number(req?.maxAgeMs);
      const matchIn = Array.isArray(req?.match) ? req.match : [];
      const match = matchIn
        .slice(0, 24)
        .map((row) => ({
          path: String(row?.path || '').trim().slice(0, 128),
          op: ['eq', 'gte', 'lte', 'contains'].includes(String(row?.op || ''))
            ? String(row.op)
            : 'eq',
          value: String(row?.value ?? '').slice(0, 256)
        }))
        .filter((row) => row.path.length > 0);
      const resolvesVerificationLink = match.some((row) =>
        /^(?:resolved|resolution)\./.test(
          String(row.path || '').trim().toLowerCase().replace(/^data\./, '')
        )
      );
      const effectiveMaxAgeMs = Number.isFinite(maxAgeMs) && maxAgeMs > 0
        ? Math.floor(maxAgeMs)
        : resolvesVerificationLink
          ? 5 * 60 * 1000
          : null;
      return {
        verifierId,
        optional,
        minCount,
        ...(effectiveMaxAgeMs ? { maxAgeMs: effectiveMaxAgeMs } : {}),
        ...(match.length > 0 ? { match } : {})
      };
    })
    .filter((row) => row.verifierId.length > 0);
}

export function hashGatePolicy(requirements) {
  const canonical = JSON.stringify(sanitizeGateRequirements(requirements));
  return `0x${bytesToHex(sha256(new TextEncoder().encode(canonical)))}`;
}

export function resolveGateSubjectAccountId(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return resolveGateSubjectAccountId(raw.accountId || raw.address);
  }
  const value = String(raw || '').trim();
  if (!value) return '';
  if (value.startsWith('did:pkh:')) {
    const parts = value.split(':');
    return String(parts[parts.length - 1] || '').trim();
  }
  const caip10 = value.match(/^[a-z0-9]+:[^:]+:(.+)$/i);
  if (caip10?.[1]) return String(caip10[1]).trim();
  return value;
}

export function defineGate(requirements) {
  return sanitizeGateRequirements(requirements);
}

export function createGate(requirements) {
  return defineGate(requirements);
}

export function combineGates(...gates) {
  const combined = [];
  const seen = new Set();

  for (const gate of gates) {
    for (const req of gate) {
      const key = req.verifierId + JSON.stringify(req.match || {});
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(req);
      }
    }
  }

  return combined;
}
