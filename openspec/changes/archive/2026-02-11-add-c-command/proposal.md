## Why

The CLI can install skills from the default registry, but there is no dedicated command to install registry-backed commands. Users currently need to know or assemble a full source URL, which is error-prone and inconsistent with the curated registry experience.

## What Changes

- Add a new `add-c` command that installs commands from the default registry `commands/` directory.
- Support `add`-equivalent flags for command installs: `-g/--global`, `-a/--agent`, `-c/--command` (like `add -s`), `-l/--list`, `-y/--yes`, and `--all`.
- Resolve the install source using the default registry constants (same registry host, `commands/` subpath).
- Reuse existing add/install logic and lockfile behavior where applicable.
- Provide clear error messaging when the name is missing or invalid.

## Capabilities

### New Capabilities

- `command-install`: Install a command by name from the default registry `commands/` directory.

### Modified Capabilities

-

## Impact

- CLI surface area: new command and help text.
- Add/install flow: reuse existing installers, source parsing, and provider logic with a `commands/` default subpath.
- Tests: new command tests and coverage for default registry resolution, supported flags, and invalid arguments.
