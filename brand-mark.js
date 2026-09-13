/**
 * Proofable mark + OG URLs hosted on proofable.me.
 * Stable paths — replace assets in place on proofable.me (no query-string versions).
 */
export const PROOFABLE_MARK_CDN_ORIGIN = 'https://proofable.me';

const PACK_BASE = `${PROOFABLE_MARK_CDN_ORIGIN}/images/proofable-brand-pack`;

/**
 * @param {string} file e.g. `favicon.svg`
 */
export function brandPackUrl(file) {
  const name = file.replace(/^\//, '');
  return `${PACK_BASE}/${name}`;
}

/** Canonical 1:1 Proofable mark raster. Transparent Arctic on a square artboard. */
export const PROOFABLE_DEFAULT_MARK_URL = brandPackUrl('web/proofable-mark-512.png');

/** 1:1 company / org tile. Transparent mark at ~80% occupancy. */
export const PROOFABLE_COMPANY_LOGO_URL = brandPackUrl('social/proofable-company-logo.png');

/** Graphite company / org tile when a host flattens transparency onto white. */
export const PROOFABLE_COMPANY_LOGO_DARK_URL = brandPackUrl('social/proofable-company-logo-dark.png');

/** Sole art-directed default social and Open Graph card. */
export const PROOFABLE_DEFAULT_OG_IMAGE_URL = brandPackUrl('social/proofable-social-card.png');
