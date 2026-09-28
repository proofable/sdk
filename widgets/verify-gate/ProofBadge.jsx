'use client';
import { useEffect, useState } from 'react';
import { PROOFABLE_DEFAULT_MARK_URL } from '../../brand-mark.js';
import { isSuccessStatus } from '@proofable/sdk/utils';

const DEFAULT_API_BASE = 'https://api.proofable.me';

const QHASH_RE = /^0x[0-9a-fA-F]{64}$/;

function isValidQHash(value) {
  return typeof value === 'string' && QHASH_RE.test(value);
}

const ProofableLogo = ({ size = 12, logoUrl }) => (
  <img
    src={logoUrl ?? PROOFABLE_DEFAULT_MARK_URL}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      display: 'block',
      borderRadius: 2,
      flexShrink: 0,
      objectFit: 'contain',
      background: 'transparent'
    }}
  />
);

export function ProofBadge({
  qHash,
  proofUrlPattern = '/proof/:qHash',
  size = 'sm',
  uiLinkBase = 'https://proofable.me',
  apiUrl = DEFAULT_API_BASE,
  proof = undefined,
  showChains = false,
  showLabel = true,
  label: verifiedLabel = 'Verified',
  logoUrl = undefined,
  onClick = undefined,
  className = ''
}) {
  const resolvedQHash = qHash ?? proof?.qHash;
  const [loaded, setLoaded] = useState(null);
  const currentLoad = loaded?.qHash === resolvedQHash && loaded?.apiUrl === apiUrl ? loaded : null;
  const record = proof ?? currentLoad?.proof;
  const proofStatus = String(record?.status ?? '').trim().toLowerCase();
  const status = record
    ? record.revokedAt || record.hidden === true
      ? 'failed'
      : isSuccessStatus(proofStatus)
        ? 'verified'
        : proofStatus.startsWith('pending') || proofStatus.startsWith('processing')
          ? 'pending'
          : proofStatus ? 'failed' : 'unknown'
    : !resolvedQHash
      ? 'unknown'
      : !isValidQHash(resolvedQHash) || currentLoad ? 'failed' : 'pending';
  const crosschain = record?.crosschain;
  const chainCount = crosschain
    ? crosschain.totalChains || Object.keys(crosschain.relayResults || {}).length + (crosschain.hubTxHash ? 1 : 0)
    : 0;

  useEffect(() => {
    if (!isValidQHash(resolvedQHash) || proof) return;

    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch(`${apiUrl}/api/v1/proofs/${resolvedQHash}`, {
          headers: { Accept: 'application/json' }
        });

        const json = res.ok ? await res.json() : null;
        if (cancelled) return;
        setLoaded({ qHash: resolvedQHash, apiUrl, proof: json?.data ?? null });
      } catch (_) {
        if (!cancelled) setLoaded({ qHash: resolvedQHash, apiUrl, proof: null });
      }
    }

    checkStatus();

    return () => { cancelled = true; };
  }, [resolvedQHash, proof, apiUrl]);

  const base = String(uiLinkBase).replace(/\/$/, '');
  const href = isValidQHash(resolvedQHash)
    ? `${base}${String(proofUrlPattern).replace(':qHash', resolvedQHash)}`
    : base;

  const isSm = size === 'sm';
  const logoSize = isSm ? 12 : 14;
  const fontSize = isSm ? 10 : 11;
  const gap = isSm ? 4 : 5;
  const padY = isSm ? 2 : 3;
  const padX = isSm ? 6 : 8;

  const label = status === 'verified' ? verifiedLabel :
    status === 'pending' ? 'Pending' : status === 'unknown' ? 'Unknown' : 'Unverified';

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap,
    textDecoration: 'none',
    padding: `${padY}px ${padX}px`,
    borderRadius: 9999,
    border: '1px solid var(--proofable-badge-border, rgba(148, 163, 184, 0.2))',
    background: 'var(--proofable-badge-bg, rgba(148, 163, 184, 0.06))',
    color: 'var(--proofable-badge-text, #94a3b8)',
    fontFamily: 'var(--proofable-badge-font, inherit)',
    fontWeight: 500,
    fontSize,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    cursor: 'pointer',
    transition: 'opacity 0.15s ease'
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick({ qHash: resolvedQHash, status, chainCount });
    }
  };

  const title = showChains && chainCount > 0
    ? `${label} on ${chainCount} chain${chainCount === 1 ? '' : 's'}`
    : label;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={style}
      className={className}
      aria-label={title}
      title={title}
      onClick={handleClick}
    >
      <ProofableLogo size={logoSize} logoUrl={logoUrl} />
      {showLabel && <span>{label}</span>}
      {showChains && chainCount > 0 && (
        <span style={{ opacity: 0.7, fontSize: fontSize - 1 }}>
          {chainCount}
        </span>
      )}
    </a>
  );
}

/** Retained public entry point; rendering and status belong to ProofBadge. */
export function SimpleProofBadge(props) {
  return <ProofBadge {...props} showLabel />;
}

export function ProofablePillLink({
  qHash,
  proofUrlPattern = '/proof/:qHash',
  uiLinkBase = 'https://proofable.me',
  label = 'View',
  size = 'sm',
  logoUrl = undefined,
  onClick = undefined,
  className = ''
}) {
  const resolvedQHash = qHash;
  const base = String(uiLinkBase).replace(/\/$/, '');
  const href = isValidQHash(resolvedQHash)
    ? `${base}${String(proofUrlPattern).replace(':qHash', resolvedQHash)}`
    : base;

  const isSm = size === 'sm';
  const logoSize = isSm ? 12 : 14;
  const fontSize = isSm ? 10 : 11;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    textDecoration: 'none',
    padding: '2px 6px',
    borderRadius: 9999,
    border: '1px solid var(--proofable-badge-border, rgba(148, 163, 184, 0.2))',
    background: 'var(--proofable-badge-bg, transparent)',
    color: 'var(--proofable-badge-text, #94a3b8)',
    fontFamily: 'var(--proofable-badge-font, inherit)',
    fontWeight: 500,
    fontSize,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    cursor: 'pointer',
    transition: 'opacity 0.15s ease'
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick({ qHash: resolvedQHash });
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={style}
      className={className}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <ProofableLogo size={logoSize} logoUrl={logoUrl} />
      <span>{label}</span>
    </a>
  );
}

export function VerifiedIcon({
  qHash,
  proofUrlPattern = '/proof/:qHash',
  uiLinkBase = 'https://proofable.me',
  size = 14,
  logoUrl = undefined,
  tooltip = 'Proof',
  onClick = undefined,
  className = ''
}) {
  const resolvedQHash = qHash;
  const href = isValidQHash(resolvedQHash)
    ? `${String(uiLinkBase).replace(/\/$/, '')}${String(proofUrlPattern).replace(':qHash', resolvedQHash)}`
    : undefined;

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick({ qHash: resolvedQHash });
    }
  };

  const icon = (
    <span
      title={tooltip}
      className={className}
      style={{
        display: 'inline-flex',
        cursor: href || onClick ? 'pointer' : 'default',
        opacity: 0.85,
        transition: 'opacity 0.15s ease'
      }}
    >
      <ProofableLogo size={size} logoUrl={logoUrl} />
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        style={{ display: 'inline-flex', textDecoration: 'none' }}
        aria-label={tooltip}
      >
        {icon}
      </a>
    );
  }

  return icon;
}
