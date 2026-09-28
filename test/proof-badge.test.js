import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProofBadge, SimpleProofBadge } from '../widgets/verify-gate/dist/ProofBadge.js';

const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));

describe('ProofBadge evidence', () => {
  it.each([
    ['verified', 'Verified'],
    ['VERIFIED', 'Verified'],
    ['verified_no_verifiers', 'Verified'],
    ['verified_propagation_failed', 'Verified'],
    ['processing_verifiers', 'Pending'],
    ['unverified', 'Unverified'],
    ['not_verified', 'Unverified'],
    ['revoked', 'Unverified'],
    ['expired', 'Unverified'],
    ['rejected_verifier_failure', 'Unverified'],
    ['', 'Unknown'],
  ])('renders %s using the SDK status owner', (status, label) => {
    for (const Component of [ProofBadge, SimpleProofBadge]) {
      expect(render(Component, { proof: { status } })).toContain(`aria-label="${label}"`);
    }
  });

  it('does not infer verification from a successful request or missing evidence', () => {
    for (const proof of [undefined, { success: true }, { status: 'verified', revokedAt: 1 }]) {
      expect(render(ProofBadge, { proof })).not.toContain('aria-label="Verified"');
    }
  });

  it('retains the published SimpleProofBadge entry point and custom label through the owner', () => {
    const props = { proof: { status: 'verified' }, label: 'Account verified', size: 'md' };
    expect(render(SimpleProofBadge, props)).toBe(render(ProofBadge, props));
    expect(render(SimpleProofBadge, props)).toContain('aria-label="Account verified"');
  });

  it('does not make a proof URL from a malformed ID', () => {
    expect(render(ProofBadge, { qHash: 'example', uiLinkBase: 'https://proofable.me' }))
      .not.toContain('href="https://proofable.me/proof/example"');
  });
});
