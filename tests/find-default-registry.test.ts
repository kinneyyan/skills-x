import { describe, it, expect } from 'vitest';
import {
  buildDefaultRegistrySkillUrl,
  formatNonInteractiveResults,
  matchesDefaultRegistrySkillName,
} from '../src/find.ts';

describe('default registry search helpers', () => {
  it('matches skill names with case-insensitive substring', () => {
    expect(matchesDefaultRegistrySkillName('Code Review', 'review')).toBe(true);
    expect(matchesDefaultRegistrySkillName('Code Review', 'REVIEW')).toBe(true);
    expect(matchesDefaultRegistrySkillName('Code Review', 'audit')).toBe(false);
  });

  it('builds default registry web URLs', () => {
    const url = buildDefaultRegistrySkillUrl('/tmp/skills/my-skill');
    expect(url).toBe('https://github.ab-inbev.cn/Kinney-Yan/prompts/tree/main/skills/my-skill');
  });

  it('formats non-interactive output with divider when both sections exist', () => {
    const defaultResults = [
      {
        kind: 'default' as const,
        name: 'my-skill',
        registryUrl: 'https://github.ab-inbev.cn/Kinney-Yan/prompts/tree/main/skills/my-skill',
      },
    ];
    const apiResults = [
      {
        name: 'Cool Skill',
        slug: 'cool-skill',
        source: 'owner/repo',
        installs: 123,
      },
    ];

    const lines = formatNonInteractiveResults(defaultResults, apiResults);

    expect(lines.some((line) => line.includes('Default registry'))).toBe(true);
    expect(lines.some((line) => line.includes('npx skills add <name>'))).toBe(true);
    expect(lines.some((line) => line.includes('my-skill'))).toBe(true);
    expect(lines.some((line) => line.includes('skills.sh/cool-skill'))).toBe(true);
    expect(lines.some((line) => line.includes('owner/repo@Cool Skill'))).toBe(true);
    expect(lines.some((line) => line.includes('------------------------------'))).toBe(true);
  });
});
