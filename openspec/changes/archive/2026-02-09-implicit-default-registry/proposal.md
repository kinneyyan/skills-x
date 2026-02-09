# Proposal: Implicit Default Registry

## Problem
Currently, `npx skills add` requires a `<source>` argument. Even with the new default registry support, users must still type `npx skills add code-review`. If they want to use flags like `--all` or `--list` against the default registry, they currently can't do so without providing a source.

Example of what currently fails:
`npx skills add --all`
`npx skills add --list`

## Proposed Change
Allow the `<source>` argument to be omitted. If it's missing, but other flags are provided, the CLI should automatically use the `DEFAULT_REGISTRY_URL`.

Example of new usage:
`npx skills add --list` (Lists all curated skills)
`npx skills add --all` (Installs all curated skills)
`npx skills add --skill frontend-design` (Installs a specific skill from the registry)

## Goals
- Make the curated registry the "first-class" experience.
- Reduce typing for common operations.
- Maintain error reporting when NO arguments or flags are provided.

## Non-Goals
- Changing how explicit sources work.
- Defaulting to the registry when no flags are provided (should still error to avoid accidental bulk installs).
