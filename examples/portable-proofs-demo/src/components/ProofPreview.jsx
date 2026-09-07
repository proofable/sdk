import React from 'react';
import { PROOFABLE_DEFAULT_MARK_URL } from '@proofable/sdk/brand-mark';
import { getProofLineDetails } from '../claims.js';

const PLACEHOLDER = '0x7a2f4c9e1b8d0f3a5c6e7d8b9a0f1e2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0';

function shortId(id) {
  if (typeof id !== 'string' || id.length < 18) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function ProofPreview({ claim, qHash }) {
  if (!claim) {
    return (
      <div
        className="flex min-h-[3.5rem] items-center rounded-lg px-3.5 py-2.5 text-sm"
        style={{ border: '1px solid var(--proofable-border-subtle)', color: 'var(--proofable-text-muted)' }}
      >
        <p className="m-0 w-full text-center text-[0.8125rem]">Select a claim to preview a proof</p>
      </div>
    );
  }

  const isLive = Boolean(qHash);
  const id = qHash || PLACEHOLDER;
  const d = isLive ? getProofLineDetails(claim) : null;
  const showRich = Boolean(d);

  return (
    <div
      className="rounded-lg p-3.5"
      style={{
        border: '1px solid var(--proofable-border-subtle)',
        background: isLive ? 'rgba(var(--proofable-rgb-accent-primary) / 0.07)' : 'rgb(var(--proofable-rgb-surface-card) / 0.35)',
        boxShadow: isLive ? 'inset 0 0 0 1px rgba(var(--proofable-rgb-accent-primary) / 0.12)' : 'none'
      }}
    >
      <div className="mb-1.5 flex items-start gap-2.5">
        <img className="h-5 w-5 rounded" src={PROOFABLE_DEFAULT_MARK_URL} width={20} height={20} alt="" />
        <div>
          <p
            className="mb-0.5 text-[0.65rem] font-medium uppercase tracking-wide"
            style={{ color: 'var(--proofable-text-muted)' }}
          >
            Proof
          </p>
          <p className="m-0 text-[0.95rem] font-semibold" style={{ color: 'var(--proofable-text-primary)' }}>
            {claim.title}
          </p>
        </div>
      </div>

      {showRich && d && (
        <div className="mb-3 space-y-1.5 border-t border-[var(--proofable-border-faint)] pt-3 text-[0.8125rem]">
          <div className="flex justify-between gap-3">
            <span className="text-[var(--proofable-text-muted)]">Subject</span>
            <span className="font-medium text-[var(--proofable-text-primary)]">{d.subject}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--proofable-text-muted)]">Claim</span>
            <span className="text-right font-medium text-[var(--proofable-text-primary)]">{d.claimLine}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--proofable-text-muted)]">Status</span>
            <span className="font-medium" style={{ color: 'var(--proofable-primary)' }}>
              {d.status}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--proofable-text-muted)]">Privacy</span>
            <span className="text-right text-[var(--proofable-text-secondary)]">{d.privacy}</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
            <span className="shrink-0 text-[var(--proofable-text-muted)]">Works across</span>
            <span className="text-[var(--proofable-text-secondary)] sm:text-right">{d.worksAcross}</span>
          </div>
        </div>
      )}

      <p className="mb-0.5 text-[0.65rem] font-medium uppercase tracking-wide" style={{ color: 'var(--proofable-text-muted)' }}>
        qHash
      </p>
      <p
        className="m-0 font-mono text-[0.85rem] leading-tight"
        style={{ color: isLive ? 'var(--proofable-primary)' : 'var(--proofable-text-muted)' }}
        title={id}
      >
        {shortId(id)}
      </p>
    </div>
  );
}
