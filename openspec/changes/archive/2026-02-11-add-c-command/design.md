## Context

The CLI currently installs skills via `skills add`, including listing, selecting agents, and global installs. We need a parallel `add-c` command that installs registry-backed commands from the default registry `commands/` subpath, while supporting the same install-flow flags as `add`.

Commands are single markdown files stored in the registry `commands/` directory. The command name is the markdown filename (without `.md`). Descriptions (when present) come from the file's YAML frontmatter `description` field and are displayed in list output. Commands install into agent-specific directories that differ by agent (unlike skills). Example: `claude-code` uses `.claude/commands`, while `kilo` uses `.kilocode/workflows`.

## Goals / Non-Goals

**Goals:**

- Add `skills add-c` to install commands from the default registry `commands/` directory.
- Support the same user-facing flags as `add`: `-g/--global`, `-a/--agent`, `-c/--command` (like `add -s`), `-l/--list`, `-y/--yes`, and `--all`.
- Reuse the existing add/install flow (discovery, selection, install, lockfile) as much as possible.
- Ensure commands are installed into the correct per-agent command directory.

**Non-Goals:**

- Support arbitrary sources (URLs, owner/repo, local paths) for `add-c`.
- Change behavior of the existing `add` command.
- Introduce a new packaging format for commands.

## Decisions

- **CLI surface:** Add a new top-level `add-c` command (with help/banner updates) implemented alongside `add`. The first non-flag argument is treated as a command name; it is equivalent to providing `-c/--command <name>` and can be combined with additional `-c` values.
- **Source resolution:** Always resolve to `DEFAULT_REGISTRY_URL` with a new `DEFAULT_COMMANDS_SUBPATH = 'commands'`. `add-c` should reject non-name sources (URLs, owner/repo, local paths) with a clear error. For `-l/--list` or `--all`, the default registry is used even if no name is provided.
- **Option semantics:**
  - `--all` implies `--command '*'`, `--agent '*'`, and `--yes`, matching `add` semantics.
  - `-l/--list` lists available commands from the default registry and exits.
  - `-g/--global`, `-a/--agent <agents...>`, and `-y/--yes` reuse the same install prompts/short-circuits as `add`.
- **Command discovery model:** Commands are markdown files, not SKILL packages. Implement command discovery by scanning for `.md` files under the `commands/` subpath, deriving command names from filenames, and extracting optional descriptions from YAML frontmatter (no SKILL.md parsing).
- **Agent-specific command paths:** Extend agent config with command directory fields (e.g., `commandsDir`, `globalCommandsDir`) and use those for installation targets. Support only these agents initially, and when prompting for agents in interactive mode, list only these supported agents:
  - `claude-code`: global `.claude/commands`, project `<projectPath>/.claude/commands`
  - `opencode`: global `.opencode/commands`, project `<projectPath>/.opencode/commands`
  - `cline`: global `~/Documents/Cline/Workflows/` (macOS/Linux) or `C:\\Users\\<USER>\\Documents\\Cline\\Workflows\\` (Windows), project `<projectPath>/.clinerules/workflows`
  - `kilo`: global `~/.kilocode/workflows`, project `<projectPath>/.kilocode/workflows/`
    Agents without explicit command paths are not supported by `add-c` and should error with a clear message.
- **Canonical + symlink approach:** Mirror the skills installer pattern with a canonical base like `.agents/commands/<name>.md` (and `~/.agents/commands/<name>.md` for global). Install to canonical and symlink (or copy on failure) into each agent’s command directory. This preserves the existing install-mode behavior while still placing commands under agent-specific paths.

## Risks / Trade-offs

- **[Registry format mismatch]** If commands in the default registry are not structured like skills, discovery may fail or install the wrong files. → Mitigation: verify the commands directory structure and adjust discovery to look for the correct manifest if needed.
- **[Ambiguous input handling]** Users may pass a repo/URL expecting it to work. → Mitigation: explicit error that `add-c` only supports command names from the default registry.
- **[Subpath handling]** Missing `commands/` subpath would scan the wrong tree. → Mitigation: enforce subpath in a dedicated code path for `add-c`.
- **[Agent path mismatch]** Incorrect or missing `commandsDir` values will install to the wrong location. → Mitigation: define explicit command paths for supported agents and fail fast with a clear error when a selected agent lacks a command path.

## Migration Plan

- Additive change only. Update CLI help/README if needed. No data migrations.

## Open Questions

- Confirm the commands directory manifest format in the default registry. If it differs from skills, discovery will need to target the appropriate file(s).
