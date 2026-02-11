import { describe, it, expect } from 'vitest';
import { tmpdir } from 'os';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { parseAddCommandOptions } from './add.ts';
import { runCli } from './test-utils.ts';

describe('add-c command parsing', () => {
  it('parses command flags and positional args', () => {
    const { commands, options } = parseAddCommandOptions([
      'foo-command',
      '-c',
      'bar-command',
      '-a',
      'claude-code',
      'kilo',
      '-g',
      '-y',
      '--list',
    ]);

    expect(commands).toEqual(['foo-command']);
    expect(options.command).toEqual(['bar-command']);
    expect(options.agent).toEqual(['claude-code', 'kilo']);
    expect(options.global).toBe(true);
    expect(options.yes).toBe(true);
    expect(options.list).toBe(true);
  });

  it('parses repeated -c/--command values', () => {
    const { commands, options } = parseAddCommandOptions([
      '-c',
      'alpha',
      'beta',
      '--command',
      'gamma',
    ]);

    expect(commands).toEqual([]);
    expect(options.command).toEqual(['alpha', 'beta', 'gamma']);
  });
});

describe('add-c command validation', () => {
  it('rejects non-name sources', () => {
    const cwd = join(tmpdir(), 'skills-add-c-test');
    mkdirSync(cwd, { recursive: true });
    const result = runCli(['add-c', 'https://example.com'], cwd);
    expect(result.stdout).toContain('Invalid command name');
    expect(result.exitCode).toBe(1);
  });
});
