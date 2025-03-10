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
- 📊 Comprehensive logging system with multiple log levels
- ⚠️ Robust error handling with standardized error responses
- ⚙️ Flexible configuration through environment variables
- 🚀 Performance optimization for processing large files

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

### Configuration

The server can be configured using environment variables. You can create a `.env` file in the root directory based on the provided `.env.example` file:

```bash
# Server configuration
PORT=3000                # Port for the server to listen on
HOST=127.0.0.1           # Host for the server to bind to
NODE_ENV=development     # Environment (development, production, test)

# Logging configuration
LOG_LEVEL=2              # 0=ERROR, 1=WARN, 2=INFO, 3=DEBUG, 4=TRACE
LOG_TO_FILE=false        # Whether to log to a file
LOG_DIR=logs             # Directory for log files

# Performance configuration
CHUNK_SIZE=1048576       # 1MB chunk size for processing large files
MAX_WORKERS=4            # Number of concurrent workers for batch processing
MEMORY_LIMIT=536870912   # 512MB memory limit before using streaming
```

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
- `POST /api/get-progress`: Get progress information for directory processing operations

### Request Parameters

#### Strip Comments Endpoint

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | Optional. Raw code text to be processed |
| `filePath` | string | Optional. Path to a single file to process |
| `directoryPath` | string | Optional. Path to a directory to process |
| `recursive` | boolean | Optional. Whether to recursively process subdirectories (default: true) |
| `fileTypes` | string[] | Optional. Array of file extensions to process (default: ['js', 'ts', 'vue', 'css', 'scss', 'less', 'html', 'py', 'java', 'cs', 'cpp', 'c', 'rb', 'php']) |
| `trackProgress` | boolean | Optional. Whether to track progress for directory processing (default: false) |

#### Get Progress Endpoint

| Parameter | Type | Description |
|-----------|------|-------------|
| `trackerId` | string | Required. The ID of the progress tracker to query |

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    "original": "// Original code with comments\nconst x = 10;",
    "stripped": "const x = 10;"
  }
}
```

For directory processing with progress tracking:

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filePath": "/path/to/file1.js",
        "original": "// Original code\nconst x = 10;",
        "stripped": "const x = 10;"
      },
      // More files...
    ],
    "progress": {
      "trackerId": "dir_1678901234567",
      "processed": 10,
      "total": 10,
      "percentage": 100
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## Error Handling

The server provides standardized error responses with the following error codes:

- `VALIDATION_ERROR`: Invalid input parameters
- `FILE_SYSTEM_ERROR`: File system access or permission issues
- `UNSUPPORTED_FILE_TYPE`: Unsupported file extension
- `PROCESSING_ERROR`: Error during comment stripping process
- `INTERNAL_ERROR`: Unexpected server error

## Logging

The server uses a configurable logging system with the following log levels:

- `ERROR (0)`: Critical errors that prevent operation
- `WARN (1)`: Warning conditions that should be addressed
- `INFO (2)`: Informational messages about normal operation
- `DEBUG (3)`: Detailed debug information
- `TRACE (4)`: Very detailed tracing information

Logs can be output to the console and optionally to a file. The log level and file logging can be configured through environment variables.

## Performance Optimization

For large files, the server uses a streaming approach to process the file in chunks, which reduces memory usage and improves performance. The chunk size and memory limit can be configured through environment variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request