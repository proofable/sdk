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

/** Canonical explicit-circle particle-ring vector. */
export const PROOFABLE_DEFAULT_MARK_URL = brandPackUrl('web/proofable-mark-512.png');

/** Sole art-directed default social and Open Graph card. */
export const PROOFABLE_DEFAULT_OG_IMAGE_URL = brandPackUrl('social/proofable-social-card.png');
