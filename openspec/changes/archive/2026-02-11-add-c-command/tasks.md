## 1. Command Registry Wiring

- [x] 1.1 Add `DEFAULT_COMMANDS_SUBPATH` constant and use it for `add-c` default registry resolution
- [x] 1.2 Add command-source parser helper or `add-c` parsing that only accepts command names (reject URL/owner-repo/local paths)
- [x] 1.3 Add `-c/--command` to parse command selection (mirror add `-s/--skill` behavior)
- [x] 1.4 Implement `--all` behavior for `add-c` (implies `--command '*'`, `--agent '*'`, `--yes`)

## 2. Agent Command Paths

- [x] 2.1 Extend `AgentConfig` with `commandsDir` and `globalCommandsDir`
- [x] 2.2 Populate command paths for supported agents only: `claude-code`, `opencode`, `cline`, `kilo`
- [x] 2.3 Enforce unsupported-agent errors for `add-c` and restrict interactive agent list to supported agents

## 3. Installation Pipeline for Commands

- [x] 3.1 Add command install helpers (`getCanonicalCommandsDir`, `installCommandForAgent`, `getCommandInstallPath`, `isCommandInstalled`)
- [x] 3.2 Discover commands by scanning `.md` files under `commands/` (no SKILL.md parsing)
- [x] 3.3 Ensure file-based install mode (symlink/copy) and global/project behavior works with command paths
- [x] 3.4 Extract optional command descriptions from YAML frontmatter for list output

## 4. CLI + UX

- [x] 4.1 Add `add-c` command to CLI routing and help/banner output
- [x] 4.2 Add usage + examples for `add-c` including flags (`-g`, `-a`, `-c`, `-l`, `-y`, `--all`)
- [x] 4.3 Ensure list mode prints commands and exits cleanly

## 5. Tests

- [x] 5.1 Add parser tests for `add-c` flags and invalid sources
- [x] 5.2 Add install-path tests for supported agents’ command directories
- [x] 5.3 Add integration tests for list/all/agent selection restrictions
