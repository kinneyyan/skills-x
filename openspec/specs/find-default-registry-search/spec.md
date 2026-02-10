# Capability: Find Default Registry Search

## Purpose
The `find` command searches for skills in both the curated default registry and the remote API to provide a comprehensive discovery experience.

## Requirements

### Requirement: Search default registry before API
The `find` command SHALL search the default registry for skills by name before invoking the remote API search.

#### Scenario: Default registry matches query
- **WHEN** the user searches with a query that matches one or more default registry skill names
- **THEN** the command includes those matches in the results and still performs the API search afterward

### Requirement: Default registry name matching uses substring
Default registry matching SHALL be case-insensitive substring matching on the skill name.

#### Scenario: Partial name match
- **WHEN** the user searches for a substring of a default registry skill name
- **THEN** the skill appears in the default registry results

### Requirement: Results are displayed in two sections
The `find` command SHALL render default registry results first and API results second, separated by a divider when both sections have items.

#### Scenario: Both sections have results
- **WHEN** the default registry and API searches each return results
- **THEN** the output shows a default registry section, a divider, and an API section in that order

### Requirement: Default registry install hint and URL
Default registry results SHALL display the install hint `npx skills add <name>` and the skill’s directory URL in the default registry web view.

#### Scenario: Default registry result output
- **WHEN** a default registry skill is displayed in the results
- **THEN** the output includes `npx skills add <name>` and a URL to the skill’s directory in the default registry repository

### Requirement: API results retain existing behavior
API results SHALL retain existing output formatting and install guidance.

#### Scenario: API result output
- **WHEN** a skill is returned only by the API search
- **THEN** it is displayed using the current API output format and install guidance

### Requirement: Registry failures do not block API search
If the default registry cannot be accessed or parsed, the command SHALL still execute the API search and display API results.

#### Scenario: Registry fetch fails
- **WHEN** the default registry clone or discovery fails
- **THEN** the command continues with API search and displays API results if any
