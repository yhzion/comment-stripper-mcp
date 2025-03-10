# STATUS Writing Rules

This document outlines the guidelines for maintaining the `docs/STATUS.md` file.

## Purpose

The STATUS.md file provides a current snapshot of the project's implementation state, serving as a quick reference for contributors and users to understand the current state of development.

## Structure

The STATUS.md file should maintain the following structure:

1. **Header**: Brief introduction to the document
2. **Last Updated**: Date when the document was last updated
3. **Current Version**: The current version of the project
4. **Implementation Status**: Table of component statuses
5. **Supported Languages**: Table of language support status
6. **Known Issues**: List of known issues or limitations
7. **Next Steps**: Immediate development priorities
8. **Roadmap Progress**: Reference to detailed roadmap

## Status Table Format

Implementation status should be presented in a table format:

```markdown
| Component | Status | Notes |
|-----------|--------|-------|
| Component Name | Status Marker | Optional notes about current state |
```

## Status Markers

Use the same status markers as in TODO.md:

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Implemented (but not fully tested)
- ✅ Tested & Completed

## Updating Guidelines

1. **When to Update**:
   - Update STATUS.md whenever there's a significant change in project status
   - Always update before releases
   - Update at least once per sprint/development cycle

2. **Updating Last Updated**:
   - Always update the "Last Updated" date when making changes
   - Use the format: YYYY-MM-DD

3. **Current Version**:
   - Keep the current version in sync with HISTORY.md
   - Use the same semantic versioning format: v{MAJOR}.{MINOR}.{PATCH}

4. **Component Status**:
   - Update the status marker for each component as development progresses
   - Add meaningful notes about partial implementations or limitations
   - Add new components as they are identified

5. **Language Support**:
   - Update as new language support is added
   - Include notes about any limitations for specific languages

6. **Known Issues**:
   - List all known bugs, limitations, or concerns
   - Remove issues when they are resolved
   - Include workarounds if available

7. **Next Steps**:
   - Keep this as a short list (3-5 items) of immediate priorities
   - Focus on what's coming next, not the entire roadmap

The STATUS.md file should be concise and accurate, providing a clear picture of the current state without overwhelming detail.
