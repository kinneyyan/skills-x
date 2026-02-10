## Context

The `find` command currently performs only an API search against `skills.sh` and renders a single result list for both interactive and non-interactive modes. The default registry is defined in `src/constants.ts` and is already used by `add` to resolve simple identifiers via cloning and `discoverSkills`, but `find` does not use this registry, which hides curated skills from search.

Constraints:
- Keep changes contained to `src/find.ts`.
- Use default registry resolution consistent with `add` (clone + `discoverSkills`).
- Default registry results should show a registry web URL and `npx skills add <name>` install hint.

## Goals / Non-Goals

**Goals:**
- Search the default registry first by skill name (case-insensitive substring match).
- Call the API search after the registry search and merge results.
- Render two sections (default registry, API) separated by a divider, without breaking selection UX.
- Cache default registry skills per `find` run to avoid repeated clones during interactive typing.

**Non-Goals:**
- Persist a long-term cache across runs.
- Change `add`, `source-parser`, or registry constants.
- Expand match semantics beyond name substring matching.

## Decisions

- **Reuse `add` discovery flow**: Implement default registry search by cloning `DEFAULT_REGISTRY_URL` to a temp dir and using `discoverSkills` with `DEFAULT_REGISTRY_SUBPATH`.
  - *Alternatives considered*: Using the API exclusively (does not satisfy requirement); fetching raw registry index (no existing endpoint).
- **In-memory cache per run**: Store discovered skills in memory within `find.ts` to avoid re-cloning on each keystroke.
  - *Alternatives considered*: Persisted cache on disk (more invasive); re-clone per query (too slow).
- **Result sectioning with flat selection**: Keep a single selection index across two sections by flattening items and excluding the divider from selection.
  - *Alternatives considered*: Treat divider as a selectable row (confusing UX).
- **Registry web URL derivation**: Derive web base from `DEFAULT_REGISTRY_URL` by stripping `.git`, then build `.../tree/main/${DEFAULT_REGISTRY_SUBPATH}/${skillDir}`.
  - *Alternatives considered*: Resolve remote default branch dynamically (extra git calls); hardcode repo base (less robust).

## Risks / Trade-offs

- **Registry clone latency** → Mitigation: single clone per `find` invocation and reuse cached results during typing.
- **Registry connectivity failures** → Mitigation: treat failures as empty default results and proceed with API search.
- **Skill directory name mismatch** (e.g., name vs folder) → Mitigation: use folder name from `skill.path` for URL construction.

## Migration Plan

- No migration required; change is local to `find` behavior.

## Open Questions

- None. Default branch is `main` and URL derivation is fixed as specified.
