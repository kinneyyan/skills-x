import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Skill } from './types.ts';

const mockCommands: Skill[] = [
  { name: 'cmd-one', description: 'Command one', path: '/tmp/cmd-one.md' },
  { name: 'cmd-two', description: 'Command two', path: '/tmp/cmd-two.md' },
];

vi.mock('./git.ts', async () => {
  const actual = await vi.importActual<typeof import('./git.ts')>('./git.ts');
  return {
    ...actual,
    cloneRepo: vi.fn(async () => '/tmp/fake-repo'),
    cleanupTempDir: vi.fn(async () => {}),
  };
});

vi.mock('./commands.ts', async () => {
  const actual = await vi.importActual<typeof import('./commands.ts')>('./commands.ts');
  return {
    ...actual,
    discoverCommands: vi.fn(async () => mockCommands),
  };
});

vi.mock('./installer.ts', async () => {
  const actual = await vi.importActual<typeof import('./installer.ts')>('./installer.ts');
  return {
    ...actual,
    installCommandForAgent: vi.fn(async () => ({
      success: true,
      path: '/tmp/install',
      canonicalPath: '/tmp/canonical',
      mode: 'symlink',
    })),
    isCommandInstalled: vi.fn(async () => false),
    getCanonicalCommandPath: vi.fn(() => '/tmp/canonical'),
  };
});

import { runAddCommand } from './add.ts';
import { cloneRepo } from './git.ts';
import { discoverCommands } from './commands.ts';
import { installCommandForAgent } from './installer.ts';

afterEach(() => {
  vi.clearAllMocks();
});

describe('add-c integration (mocked)', () => {
  it('lists commands with --list', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit:${code}`);
    });

    await expect(runAddCommand([], { list: true })).rejects.toThrow();
    expect(vi.mocked(cloneRepo)).toHaveBeenCalled();
    expect(vi.mocked(discoverCommands)).toHaveBeenCalled();

    exitSpy.mockRestore();
  });

  it('installs all commands with --all', async () => {
    await runAddCommand([], { all: true });

    const supportedAgents = ['claude-code', 'opencode', 'cline', 'kilo'];
    expect(vi.mocked(installCommandForAgent)).toHaveBeenCalledTimes(
      mockCommands.length * supportedAgents.length
    );
  });

  it('rejects unsupported agents before cloning', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit:${code}`);
    });

    await expect(runAddCommand(['cmd-one'], { agent: ['codex'] })).rejects.toThrow();
    expect(vi.mocked(cloneRepo)).not.toHaveBeenCalled();

    exitSpy.mockRestore();
  });
});
