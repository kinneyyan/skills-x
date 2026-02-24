import { describe, it, expect, vi } from 'vitest';
import {
  buildDefaultRegistrySkillUrl,
  formatNonInteractiveResults,
  matchesDefaultRegistrySkillName,
  parseFindArgs,
  searchSkillsByMode,
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

  it('parses find args with default mode', () => {
    expect(parseFindArgs(['typescript'])).toEqual({ mode: 'default', query: 'typescript' });
  });

  it('parses find args with global mode flags', () => {
    expect(parseFindArgs(['-g', 'typescript'])).toEqual({ mode: 'global', query: 'typescript' });
    expect(parseFindArgs(['typescript', '--global'])).toEqual({
      mode: 'global',
      query: 'typescript',
    });
  });

  it('parses find args with -- option terminator', () => {
    expect(parseFindArgs(['--global', '--', '-g', 'typescript'])).toEqual({
      mode: 'global',
      query: '-g typescript',
    });
  });

  it('searches only default registry in default mode', async () => {
    const defaultSearch = vi.fn().mockResolvedValue([
      {
        kind: 'default' as const,
        name: 'my-skill',
        registryUrl: 'https://example.com/skills/my-skill',
      },
    ]);
    const apiSearch = vi
      .fn()
      .mockResolvedValue([
        { name: 'api-skill', slug: 'api-skill', source: 'owner/repo', installs: 1 },
      ]);

    const result = await searchSkillsByMode('my', 'default', {
      searchDefaultRegistry: defaultSearch,
      searchSkillsAPI: apiSearch,
    });

    expect(defaultSearch).toHaveBeenCalledTimes(1);
    expect(defaultSearch).toHaveBeenCalledWith('my');
    expect(apiSearch).not.toHaveBeenCalled();
    expect(result.defaultResults).toHaveLength(1);
    expect(result.apiResults).toHaveLength(0);
  });

  it('searches only API in global mode', async () => {
    const defaultSearch = vi.fn().mockResolvedValue([
      {
        kind: 'default' as const,
        name: 'my-skill',
        registryUrl: 'https://example.com/skills/my-skill',
      },
    ]);
    const apiSearch = vi
      .fn()
      .mockResolvedValue([
        { name: 'api-skill', slug: 'api-skill', source: 'owner/repo', installs: 1 },
      ]);

    const result = await searchSkillsByMode('api', 'global', {
      searchDefaultRegistry: defaultSearch,
      searchSkillsAPI: apiSearch,
    });

    expect(apiSearch).toHaveBeenCalledTimes(1);
    expect(apiSearch).toHaveBeenCalledWith('api');
    expect(defaultSearch).not.toHaveBeenCalled();
    expect(result.defaultResults).toHaveLength(0);
    expect(result.apiResults).toHaveLength(1);
  });

  it('formats non-interactive output for default mode only', () => {
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

    const lines = formatNonInteractiveResults('default', defaultResults, apiResults);

    expect(lines.some((line) => line.includes('Default registry'))).toBe(true);
    expect(lines.some((line) => line.includes('npx skills add <name>'))).toBe(true);
    expect(lines.some((line) => line.includes('my-skill'))).toBe(true);
    expect(lines.some((line) => line.includes('skills.sh/cool-skill'))).toBe(false);
    expect(lines.some((line) => line.includes('owner/repo@Cool Skill'))).toBe(false);
  });

  it('formats non-interactive output for global mode only', () => {
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

    const lines = formatNonInteractiveResults('global', defaultResults, apiResults);

    expect(lines.some((line) => line.includes('From https://skills.sh'))).toBe(true);
    expect(lines.some((line) => line.includes('skills.sh/cool-skill'))).toBe(true);
    expect(lines.some((line) => line.includes('owner/repo@Cool Skill'))).toBe(true);
    expect(lines.some((line) => line.includes('Default registry'))).toBe(false);
  });
});
