import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const sdkRoot = path.resolve(__dirname, '..');
const skillsRoot = path.join(sdkRoot, 'skills');

function packagedSkillNames() {
  return readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(path.join(skillsRoot, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

describe('packaged Proofable skills', () => {
  it('ships the integration and trust workflow skills used by the CLI', () => {
    expect(packagedSkillNames()).toEqual([
      'proofable-integrate',
      'proofable-trust-workflow'
    ]);
  });
});
