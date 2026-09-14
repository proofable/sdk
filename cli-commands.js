/**
 * Published CLI command strings used by docs, MCP setup, and skills.
 *
 * - Run the published CLI without a global shim.
 * - `setup` registers MCP for every supported host.
 * - `doctor --live` is the health-check command.
 */

export const PROOFABLE_PKG = '@proofable/sdk';

/** Recommended one-time install for builders using the CLI regularly. */
export const PROOFABLE_INSTALL_CLI = `npm i -g ${PROOFABLE_PKG}`;

/** Zero-install prefix — works without global install. */
export const PROOFABLE_NPX = `npx -y ${PROOFABLE_PKG}`;

/** Short commands (after `PROOFABLE_INSTALL_CLI`). */
export const PROOFABLE_SETUP_CLI = 'proofable setup';
export const PROOFABLE_AUTH_CLI = 'proofable auth';
export const PROOFABLE_DOCTOR_CLI = 'proofable doctor --live';
export const PROOFABLE_EXAMPLES_CLI = 'proofable examples';

/** One-shot copy-paste (no global install required). */
export const PROOFABLE_SETUP_NPX = `${PROOFABLE_NPX} setup`;
export const PROOFABLE_AUTH_NPX = `${PROOFABLE_NPX} auth`;
export const PROOFABLE_DOCTOR_NPX = `${PROOFABLE_NPX} doctor --live`;
export const PROOFABLE_EXAMPLES_NPX = `${PROOFABLE_NPX} examples`;

/**
 * @param {string} agentId
 * @param {'cursor' | 'claude' | 'codex' | 'hermes' | 'openclaw' | 'opencode'} [host]
 */
export function proofableMountApply(agentId, host = 'cursor') {
  const id = String(agentId || '').trim();
  return `proofable mount ${id} --apply ${host}`;
}

/**
 * @param {string} agentId
 * @param {'cursor' | 'claude' | 'codex' | 'hermes' | 'openclaw' | 'opencode'} [host]
 */
export function proofableMountApplyNpx(agentId, host = 'cursor') {
  const id = String(agentId || '').trim();
  return `${PROOFABLE_NPX} mount ${id} --apply ${host}`;
}

/** Docs and product quick start. */
export const PROOFABLE_QUICKSTART_NPX = PROOFABLE_SETUP_NPX;

/** Per-repo agent bind (after auth on the machine). */
export const PROOFABLE_MOUNT_WORKFLOW = `${PROOFABLE_AUTH_CLI}
proofable mount <agentId> --apply <host>
${PROOFABLE_DOCTOR_CLI}`;

/**
 * @param {string} subcommand
 */
export function proofableCmd(subcommand) {
  return `proofable ${String(subcommand || '').trim()}`;
}

/**
 * @param {string} subcommand
 */
export function proofableNpx(subcommand) {
  return `${PROOFABLE_NPX} ${String(subcommand || '').trim()}`;
}
