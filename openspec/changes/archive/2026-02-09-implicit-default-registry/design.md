# Design: Implicit Default Registry

## Architecture

### 1. Logic Update in `runAdd`
The `runAdd` function in `src/add.ts` will be updated to check for a missing source.

**Current Logic:**
```typescript
if (!source) {
  // Error: Missing required argument: source
}
```

**New Logic:**
```typescript
let effectiveSource = source;
const hasOptions = Object.keys(options).length > 0;

if (!effectiveSource) {
  if (hasOptions) {
    // If no source but flags are present, use the registry
    effectiveSource = DEFAULT_REGISTRY_URL;
  } else {
    // Error: Missing required argument: source
  }
}
```

### 2. Implementation Details
Since `runAdd` receives `args: string[]` (which is the source array from `parseAddOptions`), we will:
1. Check if `args` is empty.
2. Check if `options` has any active flags.
3. If both true, set `args = [DEFAULT_REGISTRY_URL]`.

### 3. Verification Plan

#### Automated Tests
- Test `runAdd([], { list: true })` triggers the discovery logic for the default registry.
- Test `runAdd([], {})` still exits with an error.

#### Manual Verification
- `npx skills add --list` -> Should show skills from the enterprise repo.
- `npx skills add --all` -> Should prompt to install all curated skills.
