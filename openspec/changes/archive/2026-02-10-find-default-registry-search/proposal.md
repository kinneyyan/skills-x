## Why

The current `find` command only searches the remote API, so skills in the default registry are invisible unless users already know the exact name to install. Adding default-registry matching improves discovery and aligns `find` with how `add` resolves registry skills.

## What Changes

- `find` will search the default registry by skill name before calling the API.
- Results will be merged and displayed in two sections (default registry first, API second) separated by a divider.
- Default-registry results will show an install hint as `npx skills add <name>` and link to the skill’s directory URL in the registry repo.
- API results keep existing behavior and output formatting.

## Capabilities

### New Capabilities
- `find-default-registry-search`: `find` can resolve and display default-registry skill matches by name.

### Modified Capabilities
- None.

## Impact

- `src/find.ts` will be extended to reuse the default registry discovery flow (clone + discover) and to render two result sections.
- Default registry constants from `src/constants.ts` will be used to construct web URLs for skills.
- No changes to other commands or to the API are required.
