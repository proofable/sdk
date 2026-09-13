import { describe, it, expect } from 'vitest';
import {
  HOUR,
  DAY,
  WEEK,
  createGate,
  defineGate,
  hashGatePolicy,
  resolveGateSubjectAccountId,
  combineGates,
  GATE_NFT_HOLDER,
  GATE_TOKEN_HOLDER,
  GATE_CONTRACT_ADMIN,
  GATE_WALLET_RISK
} from '../gates.js';

describe('gates', () => {
  it('exports time constants in ms', () => {
    expect(DAY).toBe(24 * HOUR);
    expect(WEEK).toBe(7 * DAY);
  });

  it('recipe gates name expected verifierId values', () => {
    expect(GATE_NFT_HOLDER).toEqual([{ verifierId: 'nft-ownership' }]);
    expect(GATE_TOKEN_HOLDER).toEqual([{ verifierId: 'token-holding' }]);
    expect(GATE_CONTRACT_ADMIN[0]).toMatchObject({
      verifierId: 'contract-ownership',
      maxAgeMs: HOUR
    });
    expect(GATE_WALLET_RISK).toEqual([{ verifierId: 'wallet-risk' }]);
  });

  it('defineGate sanitizes strings and match rows', () => {
    expect(defineGate(['proof-of-human'])).toEqual([
      { verifierId: 'proof-of-human', optional: false, minCount: 1 }
    ]);
    const g = defineGate([{
      verifierId: 'ownership-social',
      maxAgeMs: 1000,
      match: [{ path: 'provider', op: 'eq', value: 'github' }]
    }]);
    expect(g[0].maxAgeMs).toBe(1000);
    expect(g[0].match).toEqual([{ path: 'provider', op: 'eq', value: 'github' }]);
  });

  it('createGate is a defineGate alias', () => {
    expect(createGate(['a', 'b'])).toEqual(defineGate(['a', 'b']));
  });

  it('hashes a policy deterministically', () => {
    const a = hashGatePolicy([{ verifierId: 'proof-of-human' }]);
    const b = hashGatePolicy([{ verifierId: 'PROOF-OF-HUMAN' }]);
    expect(a).toMatch(/^0x[a-f0-9]{64}$/);
    expect(a).toBe(b);
  });

  it('unwraps CAIP-10 and did:pkh subjects', () => {
    expect(resolveGateSubjectAccountId({
      accountId: 'eip155:8453:0x5362d31881716ce4921455bfa8052ae25f4da7d6'
    })).toBe('0x5362d31881716ce4921455bfa8052ae25f4da7d6');
    expect(resolveGateSubjectAccountId(
      'did:pkh:eip155:84532:0x5362d31881716ce4921455bfa8052ae25f4da7d6'
    )).toBe('0x5362d31881716ce4921455bfa8052ae25f4da7d6');
  });

  it('combineGates deduplicates by verifierId + match', () => {
    const a = defineGate([{ verifierId: 'x', match: [{ path: 'k', op: 'eq', value: '1' }] }]);
    const b = defineGate([
      { verifierId: 'x', match: [{ path: 'k', op: 'eq', value: '1' }] },
      { verifierId: 'y' }
    ]);
    const c = combineGates(a, b);
    expect(c).toHaveLength(2);
  });
});
