/**
 * @proofable/sdk/widgets is an ESM + React entrypoint.
 *
 * This file exists to provide a clear, deterministic error for CommonJS consumers
 * rather than a cryptic ESM resolution failure.
 */
'use strict';

throw new Error(
  [
    '@proofable/sdk/widgets is ESM-only.',
    '',
    'Use ESM imports:',
    "  import { VerifyGate, ProofBadge } from '@proofable/sdk/widgets';",
    '',
    'Or in CommonJS, use dynamic import:',
    "  const { VerifyGate } = await import('@proofable/sdk/widgets');"
  ].join('\n')
);

