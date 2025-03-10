# comment-stripper-mcp

A flexible MCP server that batch processes code files to remove comments across multiple programming languages. Currently supports JavaScript, TypeScript, Vue, CSS/SCSS/LESS, HTML, Python, Java, C#, C++, Ruby, and PHP files with regex-based pattern matching.

## Overview

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to provide a service that removes comments from code files. It accepts individual files, directories (including subdirectories), or direct text input, and returns the cleaned code with comments stripped out.

This project is developed using **Test-Driven Development (TDD)** methodology, ensuring high code quality, better design, and comprehensive test coverage from the start. Each feature is first defined by tests before implementation, following the red-green-refactor cycle.

## Features

- 🔄 Process files, directories, or raw text input
- 🌐 Cross-language support (JS, TS, Vue, CSS/SCSS/LESS, HTML, Python, Java, C#, C++, Ruby, and PHP)
- 📂 Recursively handle nested directories
- ⚡ Regex-based pattern matching for efficient comment removal
- 🔌 MCP-compliant API for easy integration
- 🛠️ Built with Node.js and TypeScript
- 📊 Comprehensive logging system with multiple log levels
- ⚠️ Robust error handling with standardized error responses
- ⚙️ Flexible configuration through environment variables
- 🚀 Performance optimization for processing large files
- 🔐 API authentication for secure access
- 📈 Progress tracking for large directory processing

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

# Authentication
API_KEY=your-secret-key  # API key for authentication
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
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "text": "// This is a comment\nconst x = 10; // inline comment\n/* Block comment */\nfunction test() {}"
  }'

# Strip comments from a file
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "filePath": "/path/to/your/file.js"
  }'

# Strip comments from all supported files in a directory
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
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
  client.setApiKey('YOUR_API_KEY');
  
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

For detailed API documentation and more usage examples, see:

- [USAGE.md](docs/USAGE.md) - Comprehensive usage examples
- [STATUS.md](docs/STATUS.md) - Current implementation status
- [TODO.md](docs/TODO.md) - Roadmap and planned features
- [benchmarks.md](docs/benchmarks.md) - Performance benchmarks
- [ci-cd.md](docs/ci-cd.md) - CI/CD pipeline information

## Performance

The Comment Stripper MCP is optimized for performance, with the following benchmarks:

- JavaScript (100KB): 0.59ms (169.49 MB/s)
- JavaScript (500KB): 3.20ms (156.25 MB/s)
- Python (100KB): 0.91ms (109.89 MB/s)
- Python (500KB): 5.90ms (84.75 MB/s)

See [benchmarks.md](docs/benchmarks.md) for more detailed performance information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.