## 1. Default Registry Search

- [x] 1.1 Add default registry skill discovery to `find` using clone + `discoverSkills`
- [x] 1.2 Cache discovered default registry skills per `find` run
- [x] 1.3 Implement case-insensitive substring matching on skill names

## 2. Results Merging and Rendering

- [x] 2.1 Extend `find` results to render default registry section and API section with divider
- [x] 2.2 Preserve interactive selection behavior across two sections
- [x] 2.3 Update non-interactive output to show default registry install hint and registry web URL

## 3. Error Handling and Tests

- [x] 3.1 Ensure registry discovery failures fall back to API search
- [x] 3.2 Add or update tests for default registry matching and output formatting
