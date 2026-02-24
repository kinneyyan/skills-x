## 1. Find Mode Parsing and Command UX

- [x] 1.1 Add `find` option parsing for `-g` / `--global` and separate flags from query text
- [x] 1.2 Update `find` help/banner text and examples to document default-registry mode vs global mode
- [x] 1.3 Ensure option parsing supports `--` to treat later tokens as query text

## 2. Search Execution by Provider Mode

- [x] 2.1 Refactor `runFind` query flow to execute only default-registry search in default mode
- [x] 2.2 Add global-mode flow that executes only `searchSkillsAPI` against `https://skills.sh`
- [x] 2.3 Update interactive search prompt logic so it renders only active-provider results (no mixed sections)
- [x] 2.4 Update non-interactive output formatting so install hints and result rendering match the active provider
- [x] 2.5 Keep provider failures mode-local (no implicit fallback to the other provider)

## 3. Tests and Verification

- [x] 3.1 Add/update tests for `find` mode parsing (`-g`, `--global`, and default behavior)
- [x] 3.2 Add/update tests verifying default mode never calls API search
- [x] 3.3 Add/update tests verifying global mode skips default-registry discovery
- [x] 3.4 Add/update output-format tests for single-provider rendering in both modes
