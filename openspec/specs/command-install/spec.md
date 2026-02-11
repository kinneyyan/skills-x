# Capability: Command Install

## Purpose
The system installs registry-backed command markdown files for supported agents.

## Requirements

### Requirement: Add-c command installs registry commands by name

The system SHALL provide an `add-c` CLI command that installs commands from the default registry `commands/` directory by name. Commands are single markdown files and the command name is the markdown filename without `.md`.

#### Scenario: Install a single command by name

- **WHEN** the user runs `skills add-c <command-name>`
- **THEN** the CLI installs the matching `<command-name>.md` file from the default registry `commands/` directory

### Requirement: Add-c supports command selection flags

The system SHALL accept command selection flags equivalent to `add` for `add-c`.

#### Scenario: Install specific commands with -c/--command

- **WHEN** the user runs `skills add-c -c <command-a> -c <command-b>`
- **THEN** the CLI installs only the named commands from the default registry

#### Scenario: List available commands with -l/--list

- **WHEN** the user runs `skills add-c --list`
- **THEN** the CLI lists available commands from the default registry `commands/` directory and exits without installing

#### Scenario: Install all commands with --all

- **WHEN** the user runs `skills add-c --all`
- **THEN** the CLI selects all available commands from the default registry and proceeds to installation

### Requirement: Add-c supports agent and global flags

The system SHALL support `-a/--agent <agents...>`, `-g/--global`, and `-y/--yes` for `add-c` with the same semantics as `add`.

#### Scenario: Install to selected agents

- **WHEN** the user runs `skills add-c <command-name> --agent claude-code --agent kilo`
- **THEN** the CLI installs the command to the selected agents only

#### Scenario: Install globally

- **WHEN** the user runs `skills add-c <command-name> --global`
- **THEN** the CLI installs the command to the supported agents' global command directories

#### Scenario: Non-interactive install with -y

- **WHEN** the user runs `skills add-c <command-name> -y`
- **THEN** the CLI proceeds without interactive prompts and uses the same defaults as `add`

### Requirement: Add-c enforces default registry source

The system SHALL use the default registry URL and `commands/` subpath for all `add-c` operations.

#### Scenario: Ignore non-name sources

- **WHEN** the user provides a URL, local path, or owner/repo as the argument to `add-c`
- **THEN** the CLI rejects the input with a clear error stating that `add-c` only supports command names from the default registry

### Requirement: Add-c discovers commands from markdown files

The system SHALL discover commands by scanning for markdown files under the registry `commands/` directory and deriving command names from filenames (no SKILL.md parsing).

#### Scenario: List commands from markdown files

- **WHEN** the user runs `skills add-c --list`
- **THEN** the CLI lists each `<name>.md` file as a command named `<name>`

#### Scenario: Show command descriptions from frontmatter

- **WHEN** a command markdown file includes a YAML frontmatter `description`
- **THEN** the CLI displays that description alongside the command name in list output

### Requirement: Add-c installs to agent-specific command paths

The system SHALL install commands into each selected agent's command directory as `<name>.md` files (not skill directories).

#### Scenario: Install to claude-code and kilo paths

- **WHEN** the user selects `claude-code` and `kilo`
- **THEN** the CLI installs commands to `.claude/commands/<name>.md` for `claude-code` and `.kilocode/workflows/<name>.md` for `kilo`

#### Scenario: Unsupported agents are rejected

- **WHEN** the user selects an agent without a supported command path
- **THEN** the CLI fails with a clear error identifying unsupported agents

### Requirement: Add-c only offers supported agents in interactive selection

The system SHALL restrict the interactive agent selection list to agents that have supported command paths.

#### Scenario: Interactive selection lists only supported agents

- **WHEN** the user runs `skills add-c` and is prompted to select agents interactively
- **THEN** the CLI lists only `claude-code`, `opencode`, `cline`, and `kilo` as selectable agents
