# Delta for Default Skill Registry

## ADDED Requirements

### Requirement: Map simple identifiers to the default registry
When the add command receives a simple skill identifier, it SHALL resolve it to the default registry with a skill filter for that identifier.

#### Scenario: Simple identifier input
- GIVEN an add command input that is a single identifier
- AND the identifier contains no `/` and no `:`
- AND the identifier does not start with `.`
- AND the identifier matches the allowed name pattern (alphanumeric with hyphens)
- WHEN the input is parsed
- THEN the parsed source uses `DEFAULT_REGISTRY_URL`
- AND the parsed source uses `DEFAULT_REGISTRY_SUBPATH`
- AND the parsed source sets the skill filter to the identifier

### Requirement: Preserve explicit source parsing
The source parser SHALL continue to interpret explicit sources (URLs, owner/repo, and paths) as they do today.

#### Scenario: Owner/repo shorthand
- GIVEN an add command input in the form `owner/repo`
- WHEN the input is parsed
- THEN the parsed source targets the provided repository
- AND the default registry is not used

#### Scenario: Local path
- GIVEN an add command input that is a local path
- WHEN the input is parsed
- THEN the parsed source targets the local path
- AND the default registry is not used
