# Design: Default Skill Registry

## Architecture

### 1. Registry Configuration
We will define the default registry in `src/constants.ts` to keep it configurable.

```typescript
export const DEFAULT_REGISTRY_URL = 'https://github.ab-inbev.cn/Kinney-Yan/prompts.git';
export const DEFAULT_REGISTRY_SUBPATH = 'skills';
```

### 2. Source Parsing Logic
The `parseSource` function in `src/source-parser.ts` will be updated with a new check at the end of its logic.

**Logic:**
If the input:
- Does NOT contain `/` (not owner/repo or path)
- Does NOT contain `:` (not a URL with protocol)
- Does NOT start with `.` (not a relative path)
- Is a valid alphanumeric identifier (plus hyphens)

Then:
Map it to a `github` (or `git`) `ParsedSource` type:
```typescript
{
  type: 'github',
  url: DEFAULT_REGISTRY_URL,
  subpath: DEFAULT_REGISTRY_SUBPATH,
  skillFilter: input // The name of the skill to install
}
```

### 3. Workflow Integration
Since we are reusing the `github` type with `skillFilter`, the existing logic in `src/add.ts` will:
1. Clone the default repo.
2. Discover skills in the `skills/` subpath.
3. Filter for the specific skill name provided by the user.

## User Interface
No changes to CLI flags. Only the interpretation of the `<source>` argument changes.

## Verification Plan

### Automated Tests
- Test `parseSource('code-review')` returns the default registry config.
- Test `parseSource('./code-review')` still returns a local path.
- Test `parseSource('owner/repo')` still returns the specific GitHub repo.

### Manual Verification
- Run `npx skills add code-review` and verify it clones and installs the correct skill from the enterprise GitHub.
