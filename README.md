# comment-stripper-mcp

A flexible MCP server that batch processes code files to remove comments across multiple programming languages. Currently supports JavaScript, TypeScript, and Vue files with regex-based pattern matching.

## Overview

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to provide a service that removes comments from code files. It accepts individual files, directories (including subdirectories), or direct text input, and returns the cleaned code with comments stripped out.

## Features

- 🔄 Process files, directories, or raw text input
- 🌐 Cross-language support (initially JS, TS, Vue - more coming soon)
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
| `fileTypes` | string[] | Optional. Array of file extensions to process (default: ['js', 'ts', 'vue']) |

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