## Context

`find` currently performs both searches for each query: it fetches matches from the default registry and then queries `https://skills.sh`, merging output into default + API sections. This makes global results implicit and adds network dependency even when users only want curated default-registry results.

Constraints:

- Keep behavior consistent between interactive (`skills find`) and non-interactive (`skills find <query>`) flows.
- Preserve existing install paths: default registry results install via `skills add <name>`, API results install via `skills add <owner/repo@skill>`.
- Keep `https://skills.sh` as the only global API source.

## Goals / Non-Goals

**Goals:**

- Make default `find` mode search only the default registry.
- Add `-g` / `--global` to switch `find` to remote API search at `https://skills.sh`.
- Ensure output format and install hints match the active search mode (default or global).
- Keep error behavior explicit per mode (no hidden cross-provider fallback).

**Non-Goals:**

- Changing add/install source resolution logic.
- Introducing combined default+global results in one invocation.
- Changing API ranking, pagination, or response schema from `https://skills.sh`.

## Decisions

1. Add explicit `find` option parsing for mode selection.

- Parse `-g` and `--global` from `runFind(args)` and separate remaining args into query text.
- Keep mode local to `find` execution so no global CLI state is introduced.
- Alternative considered: infer global mode from query patterns; rejected as ambiguous and non-discoverable.

2. Use a single-provider search pipeline per invocation.

- Default mode calls only default registry discovery/matching.
- Global mode calls only `searchSkillsAPI` (`https://skills.sh`).
- Alternative considered: keep dual search and only reorder output; rejected because requirement is explicit opt-in for global search.

3. Align rendering with mode-specific data.

- Interactive view shows a single result section for the active mode.
- Non-interactive output prints one install-hint block and one result list for the active mode.
- Divider rendering is removed for default execution paths because dual-source output is no longer produced.

4. Keep per-run default-registry cache unchanged.

- Reuse existing in-memory cache/promise guards for default mode to avoid repeated clone/discovery during interactive typing.
- Global mode does not touch default-registry clone/discovery paths.

## Risks / Trade-offs

- [Behavior change for existing users] Users accustomed to mixed results may think global results disappeared.
  - Mitigation: update help text and examples to show `skills find -g <query>` for global search.
- [Flag parsing ambiguity] Query text containing `-g` as literal could be interpreted as a flag.
  - Mitigation: follow common CLI behavior and allow `--` to terminate options.
- [Smaller default result set] Default mode intentionally narrows scope.
  - Mitigation: keep global mode one flag away and document it in command help/banner.

## Migration Plan

- No data migration required.
- Release notes and CLI help updates should call out: default registry is now the default search source; `-g/--global` enables `https://skills.sh` search.

## Open Questions

- None.
