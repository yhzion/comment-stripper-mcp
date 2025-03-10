# HISTORY Writing Rules

This document outlines the guidelines for maintaining the `docs/HISTORY.md` file.

## Purpose

The HISTORY.md file serves as a chronological record of all significant changes to the project, providing versioning information and a complete change log.

## Structure

The HISTORY.md file should maintain the following structure:

1. **Header**: Brief introduction to the document
2. **Version Format**: Explanation of semantic versioning
3. **Change Log**: Chronological list of versions and changes
4. **How to Update**: Guidelines for maintaining the file

## Version Format

All version numbers should follow semantic versioning:

`v{MAJOR}.{MINOR}.{PATCH}`

- **MAJOR**: Breaking changes that require updates to client code
- **MINOR**: New features that don't break existing functionality
- **PATCH**: Bug fixes and minor improvements that don't add features

## Change Entry Format

Each change log entry should follow this format:

```
### v{VERSION} - [YYYY-MM-DD]

#### Added
- New features or capabilities added

#### Changed
- Changes in existing functionality

#### Fixed
- Bug fixes

#### Removed
- Removed features or capabilities

#### Development
- Changes related to development process, not affecting functionality
```

## Updating Guidelines

1. **Adding Entries**:
   - Always add new entries at the top of the Change Log section
   - Use the exact timestamp format [YYYY-MM-DD]
   - Include the version number in the heading

2. **Version Incrementation**:
   - MAJOR: Increment when making incompatible API changes
   - MINOR: Increment when adding functionality in a backwards compatible manner
   - PATCH: Increment when making backwards compatible bug fixes

3. **Categorizing Changes**:
   - Group related changes under appropriate categories
   - Use only the categories that are needed (don't include empty categories)
   - Use present tense for all change descriptions

4. **Initial Development**:
   - During initial development (pre-v1.0.0), minor version increases may be used for significant additions
   - Use v0.x.y format for pre-release versions

5. **Descriptive Entries**:
   - Keep descriptions concise but informative
   - Focus on the what and why, not the how
   - Include references to issue numbers when applicable

Remember to update HISTORY.md with each significant change, particularly before releases.
