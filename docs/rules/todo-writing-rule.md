# TODO Writing Rules

This document outlines the guidelines for maintaining the `docs/TODO.md` file.

## Purpose

The TODO.md file serves as a centralized task list for the project, allowing contributors to track progress and prioritize work.

## Structure

The TODO.md file should maintain the following structure:

1. **Header**: Brief introduction to the document
2. **Priority Levels**: Definition of priority levels (P0-P3)
3. **Status Legend**: Description of status markers
4. **Core Features**: Categorized list of tasks
5. **Future Enhancements**: Potential future improvements
6. **Completed Items**: List of completed tasks with dates

## Task Format

Each task should be formatted as follows:

```
- [Priority] Status Task description
```

Example:
```
- [P0] 🔴 Setup basic Node.js project with TypeScript
```

## Priority Levels

- **P0**: Critical - Must be completed for MVP
- **P1**: High - Important for basic functionality 
- **P2**: Medium - Enhances functionality but not critical
- **P3**: Low - Nice to have features

## Status Markers

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Implemented (but not fully tested)
- ✅ Tested & Completed

## Updating Guidelines

1. **Adding Tasks**:
   - Place new tasks in the appropriate category
   - Assign a priority level
   - Start with 🔴 status

2. **Updating Status**:
   - Update the status marker as work progresses (🔴→🟡→🟢→✅)
   - Do not change the task description or priority unless necessary

3. **Completing Tasks**:
   - When a task is fully tested and completed (✅), move it to the "Completed Items" section
   - Add the completion date in parentheses

4. **Organization**:
   - Within each section, tasks should be ordered by priority (P0 first)
   - Within the same priority, not-started tasks (🔴) should be below in-progress tasks (🟡)

5. **New Categories**:
   - If a task doesn't fit into existing categories, create a new category
   - Place new categories in a logical order relative to existing ones

Remember to update the TODO.md file after significant progress on any task.
