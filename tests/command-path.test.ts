import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { homedir } from 'os';
import { getCommandInstallPath } from '../src/installer.ts';

const projectRoot = '/tmp/project-root';

describe('command install paths', () => {
  it('uses claude-code project commands dir', () => {
    const path = getCommandInstallPath('my-command', 'claude-code', { cwd: projectRoot });
    expect(path).toBe(join(projectRoot, '.claude', 'commands', 'my-command.md'));
  });

  it('uses opencode project commands dir', () => {
    const path = getCommandInstallPath('my-command', 'opencode', { cwd: projectRoot });
    expect(path).toBe(join(projectRoot, '.opencode', 'commands', 'my-command.md'));
  });

  it('uses cline project commands dir', () => {
    const path = getCommandInstallPath('my-command', 'cline', { cwd: projectRoot });
    expect(path).toBe(join(projectRoot, '.clinerules', 'workflows', 'my-command.md'));
  });

  it('uses kilo project commands dir', () => {
    const path = getCommandInstallPath('my-command', 'kilo', { cwd: projectRoot });
    expect(path).toBe(join(projectRoot, '.kilocode', 'workflows', 'my-command.md'));
  });

  it('uses cline global commands dir', () => {
    const path = getCommandInstallPath('my-command', 'cline', { global: true });
    expect(path).toBe(join(homedir(), 'Documents', 'Cline', 'Workflows', 'my-command.md'));
  });

  it('throws for unsupported agents', () => {
    expect(() => getCommandInstallPath('my-command', 'codex', { cwd: projectRoot })).toThrow(
      'Agent does not support command installation'
    );
  });
});
