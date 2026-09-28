import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProofBadge, SimpleProofBadge, ProofablePillLink } from '../widgets/verify-gate/dist/ProofBadge.js';

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

  // WCAG 2.2 AA Target Size (Minimum) is 24x24 CSS px. The `sm` pill computed to
  // 16px tall (10px text x line-height 1, plus 2px padding and a 1px border per
  // side), which axe flags as `target-size` (serious) wherever two of these stack
  // in a list — measured on neus `/` and `/connect` at mobile width. Pinned here
  // because the widget ships to every consumer, so the fix has to live in the
  // widget rather than in one consumer's override.
  it('meets the 24x24 target-size minimum at every size', () => {
    for (const props of [
      { proof: { status: 'verified' } },
      { proof: { status: 'verified' }, size: 'md' },
    ]) {
      const style = (render(ProofBadge, props).match(/style="([^"]*)"/) || [])[1] || '';
      expect(style).toContain('min-height:24px');
      expect(style).toContain('min-width:24px');
      // border-box keeps the pill at exactly 24px instead of padding it past the floor.
      expect(style).toContain('box-sizing:border-box');
    }
  });

  it('carries the same target-size floor on the pill link', () => {
    const style = (render(ProofablePillLink, { label: 'View' }).match(/style="([^"]*)"/) || [])[1] || '';
    expect(style).toContain('min-height:24px');
    expect(style).toContain('min-width:24px');
    expect(style).toContain('box-sizing:border-box');
  });
});
