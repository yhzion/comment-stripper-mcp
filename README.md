# comment-stripper-mcp

A flexible MCP server that batch processes code files to remove comments across multiple programming languages. Currently supports JavaScript, TypeScript, and Vue files with regex-based pattern matching, with planned support for CSS/SCSS/LESS, HTML, Python, Java, C#, C++, Ruby, and PHP.

## Overview

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to provide a service that removes comments from code files. It accepts individual files, directories (including subdirectories), or direct text input, and returns the cleaned code with comments stripped out.

This project is developed using **Test-Driven Development (TDD)** methodology, ensuring high code quality, better design, and comprehensive test coverage from the start. Each feature is first defined by tests before implementation, following the red-green-refactor cycle.

## Features

- 🔄 Process files, directories, or raw text input
- 🌐 Cross-language support (initially JS, TS, Vue with planned expansion to CSS/SCSS/LESS, HTML, Python, Java, C#, C++, Ruby, and PHP)
- 📂 Recursively handle nested directories
- ⚡ Regex-based pattern matching for efficient comment removal
- 🔌 MCP-compliant API for easy integration
- 🛠️ Built with Node.js and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone this repository
git clone https://github.com/yhzion/comment-stripper-mcp.git
cd comment-stripper-mcp

# Install dependencies
npm install
# or
yarn install
```

### Running the Server

```bash
# Development mode
npm run dev
# or
yarn dev

# Production mode
npm run build
npm start
# or
yarn build
yarn start
```

By default, the server runs on port 3000. You can configure this through environment variables.

## Testing

This project strictly follows **Test-Driven Development (TDD)** principles:

1. **Write a failing test** first (Red phase)
2. **Implement the minimum code** to pass the test (Green phase)
3. **Refactor** the code while keeping tests passing

The project uses Jest as the testing framework with TypeScript support via ts-jest. Tests are organized into:

- **Unit tests**: Testing individual functions and components
- **Integration tests**: Testing API endpoints and interactions between components

### Running Tests

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode (for development)
npm run test:watch
# or
yarn test:watch

# Run tests with coverage report
npm run test:coverage
# or
yarn test:coverage
```

### Test Structure

- `tests/unit/`: Contains unit tests for individual functions and components
- `tests/integration/`: Contains integration tests for API endpoints
- `tests/fixtures/`: Contains sample files used for testing

### Writing Tests

When adding new features, please follow the TDD approach:

1. Write failing tests first that define the expected behavior
2. Implement the minimum code required to make tests pass
3. Refactor while ensuring tests continue to pass

Include appropriate tests for:

1. **Unit tests** for new functions or components
2. **Integration tests** for API endpoints or interactions
3. **Edge case tests** for handling special scenarios

## Usage

The server accepts MCP compatible requests. Here are some examples of how to use it:

### Using cURL

```bash
# Strip comments from a text string
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -d '{
    "text": "// This is a comment\nconst x = 10; // inline comment\n/* Block comment */\nfunction test() {}"
  }'

# Strip comments from a file
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "/path/to/your/file.js"
  }'

# Strip comments from all JS/TS/Vue files in a directory
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -d '{
    "directoryPath": "/path/to/your/directory",
    "recursive": true
  }'
```

### Using the JavaScript Client

```javascript
const { MCPClient } = require('mcp-client');

async function stripComments() {
  const client = new MCPClient('http://localhost:3000');
  
  // From text
  const result1 = await client.request('/api/strip-comments', {
    text: '// Comment\nconst x = 10;'
  });
  
  // From file
  const result2 = await client.request('/api/strip-comments', {
    filePath: './src/index.js'
  });
  
  console.log(result1, result2);
}

stripComments();
```

## API Reference

### Endpoints

- `POST /api/strip-comments`: Main endpoint for all comment stripping operations

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | Optional. Raw code text to be processed |
| `filePath` | string | Optional. Path to a single file to process |
| `directoryPath` | string | Optional. Path to a directory to process |
| `recursive` | boolean | Optional. Whether to recursively process subdirectories (default: true) |
| `fileTypes` | string[] | Optional. Array of file extensions to process (default: ['js', 'ts', 'vue']). Future versions will support ['css', 'scss', 'less', 'html', 'py', 'java', 'cs', 'cpp', 'c', 'h', 'rb', 'php'] |

### Response Format

```json
{
  "success": true,
  "data": {
    "original": "// Original code with comments\nconst x = 10;",
    "stripped": "const x = 10;"
  }
}
```

For directory processing, the response includes details for each processed file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the API specification
- All contributors and maintainers

## Documentation Guidelines

This project uses a structured documentation approach to track progress, changes, and current status.

### Documentation Files

- **[README.md](./README.md)**: Main project documentation with overview, setup instructions, and usage examples.
- **[docs/TODO.md](./docs/TODO.md)**: Prioritized list of tasks with implementation and testing status.
- **[docs/HISTORY.md](./docs/HISTORY.md)**: Timestamped work records with automatic versioning.
- **[docs/STATUS.md](./docs/STATUS.md)**: Current implementation state, continuously updated.

### Documentation Maintenance Rules

Each documentation file follows specific writing rules that can be found in the `/docs/rules` directory:

1. **[todo-writing-rule.md](./docs/rules/todo-writing-rule.md)**: Guidelines for maintaining the TODO.md file.
2. **[history-writing-rule.md](./docs/rules/history-writing-rule.md)**: Guidelines for recording changes in HISTORY.md.
3. **[status-writing-rule.md](./docs/rules/status-writing-rule.md)**: Guidelines for updating STATUS.md.

Contributors should review these rules and update the documentation files as part of regular development workflow.

### Documentation Update Requirements

**Important**: Documentation must be updated in sync with code changes. For each code modification:

1. **For any code change**:
   - Update **STATUS.md** to reflect the current implementation state
   - Add an entry to **HISTORY.md** with appropriate version increment
   
2. **For feature implementations**:
   - Update **TODO.md** to mark tasks as completed
   - Update **README.md** if the feature affects usage, API, or overall capabilities
   
3. **For major releases**:
   - Perform a comprehensive review of all documentation
   - Ensure README examples and API documentation are up-to-date
   
4. **For bug fixes**:
   - Document the fix in HISTORY.md
   - Update STATUS.md if the bug affected a component's status

This step-by-step documentation update process ensures that all project documentation remains accurate and provides a reliable reference for both users and contributors.