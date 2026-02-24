## Why

The current `find` behavior always queries both the default registry and the remote API, which is slower and can mix local curated discovery with global results when users only want default-registry matches. We need a clear, explicit switch so global search is opt-in.

## What Changes

- Change `find` command behavior to search the default registry by default.
- Add and document `-g, --global` for `find` to enable remote search against `https://skills.sh`.
- Keep output behavior aligned with the active search mode so users can clearly tell whether results are local curated results or global remote results.
- Ensure failure handling remains predictable when global mode is enabled and remote lookup fails.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `find-default-registry-search`: Update requirements so default execution searches only the default registry, and remote API search at `https://skills.sh` happens only when `-g`/`--global` is provided.

## Impact

- Affected code: `find` command logic, option parsing, and result rendering for search mode.
- Affected docs/help text: CLI usage for `find` command flags and examples.
- Affected behavior: default command latency and result scope for `find`.
- Dependencies/systems: remote lookup remains dependent on `https://skills.sh` only in global mode.
