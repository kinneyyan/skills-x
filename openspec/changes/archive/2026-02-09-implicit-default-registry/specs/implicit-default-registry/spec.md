# Delta for Implicit Default Registry

## ADDED Requirements

### Requirement: Use the default registry when source is omitted and options are provided
If no explicit source is provided but options are present, the add command SHALL use the default registry as the effective source.

#### Scenario: List curated skills with no source
- GIVEN the user runs `skills add --list`
- WHEN the add command resolves its source
- THEN the effective source is `DEFAULT_REGISTRY_URL`

#### Scenario: Install all curated skills with no source
- GIVEN the user runs `skills add --all`
- WHEN the add command resolves its source
- THEN the effective source is `DEFAULT_REGISTRY_URL`

### Requirement: Require a source when no options are provided
If no explicit source is provided and no options are present, the add command SHALL report a missing source error.

#### Scenario: No arguments
- GIVEN the user runs `skills add` with no arguments
- WHEN the add command validates inputs
- THEN it reports a missing source error
