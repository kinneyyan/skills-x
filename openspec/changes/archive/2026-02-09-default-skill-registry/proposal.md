# Proposal: Default Skill Registry

## Problem
Currently, users must provide a full GitHub URL, shorthand (owner/repo), or a local path to install a skill. This can be cumbersome for frequently used or curated skills.

Example of current usage:
`npx skills add Kinney-Yan/prompts --skill code-review`

## Proposed Change
Introduce a default registry so users can install skills by name only.

Example of desired usage:
`npx skills add code-review`

## Goals
- Simplify the installation of standard/curated skills.
- Make the CLI feel more intuitive and "package-manager-like".
- Maintain backwards compatibility (don't break existing URL/path parsing).

## Non-Goals
- Building a full-blown registry server (we will use a Git repo as the registry for now).
- Supporting multiple registries simultaneously (start with one default).

## Scope
- Modify `src/source-parser.ts` to identify simple names.
- Update `src/add.ts` (if necessary) to handle the default registry logic.
- Add tests to ensure names don't conflict with local paths or other shorthand.
