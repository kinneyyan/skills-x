# Capability: Find Default Registry Search

## Purpose
The `find` command searches for skills in either the curated default registry or the remote API, depending on the selected mode.

## Requirements

### Requirement: Search default registry before API
The `find` command SHALL use default registry search when `-g` or `--global` is not provided.
The `find` command SHALL use remote API search at `https://skills.sh` only when `-g` or `--global` is provided.

#### Scenario: Query in default mode
- **WHEN** the user runs `find` without `-g` or `--global`
- **THEN** the command searches the default registry
- **AND** the command does not execute remote API search

#### Scenario: Query in global mode
- **WHEN** the user runs `find` with `-g` or `--global`
- **THEN** the command executes remote API search at `https://skills.sh`
- **AND** the command does not search the default registry

### Requirement: Default registry name matching uses substring
Default registry matching SHALL be case-insensitive substring matching on the skill name.

#### Scenario: Partial name match
- **WHEN** the user searches for a substring of a default registry skill name
- **THEN** the skill appears in the default registry results

### Requirement: Default registry install hint and URL
Default registry results SHALL display the install hint `npx skills add <name>` and the skill’s directory URL in the default registry web view.

#### Scenario: Default registry result output
- **WHEN** a default registry skill is displayed in the results
- **THEN** the output includes `npx skills add <name>` and a URL to the skill’s directory in the default registry repository

### Requirement: API results retain existing behavior
API results SHALL retain existing output formatting and install guidance when global mode is enabled.

#### Scenario: API result output in global mode
- **WHEN** the user runs `find` with `-g` or `--global`
- **AND** a skill is returned by the API search
- **THEN** it is displayed using the current API output format and install guidance

### Requirement: Results are scoped to the active search provider
The `find` command SHALL render results from only the selected search provider for a given invocation.

#### Scenario: Default mode renders only default registry results
- **WHEN** the user runs `find` without `-g` or `--global`
- **THEN** the output contains only default registry results
- **AND** the output does not include API-result sections or dividers

#### Scenario: Global mode renders only API results
- **WHEN** the user runs `find` with `-g` or `--global`
- **THEN** the output contains only API results from `https://skills.sh`
- **AND** the output does not include default-registry sections

### Requirement: Provider failures remain mode-local
If the active search provider fails, the `find` command SHALL not fallback to the other provider implicitly.

#### Scenario: Default provider failure in default mode
- **WHEN** the user runs `find` without `-g` or `--global`
- **AND** default registry discovery fails
- **THEN** the command returns no default-registry matches
- **AND** the command does not call `https://skills.sh`

#### Scenario: API provider failure in global mode
- **WHEN** the user runs `find` with `-g` or `--global`
- **AND** the API search request fails
- **THEN** the command returns no API matches
- **AND** the command does not perform default-registry discovery
