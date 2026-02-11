import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { discoverCommands } from './commands.ts';

describe('discoverCommands', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `skills-commands-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('extracts description from YAML frontmatter', async () => {
    const commandsDir = join(testDir, 'commands');
    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(join(commandsDir, 'hello.md'), `---\ndescription: Say hello\n---\n\n# Hello\n`);

    const commands = await discoverCommands(testDir, 'commands');
    expect(commands).toHaveLength(1);
    expect(commands[0]?.name).toBe('hello');
    expect(commands[0]?.description).toBe('Say hello');
  });

  it('returns empty description when frontmatter missing', async () => {
    const commandsDir = join(testDir, 'commands');
    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(join(commandsDir, 'plain.md'), '# Plain');

    const commands = await discoverCommands(testDir, 'commands');
    expect(commands).toHaveLength(1);
    expect(commands[0]?.description).toBe('');
  });
});
