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
# Running the Server
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

## Using cURL

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

## Using the JavaScript Client

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

