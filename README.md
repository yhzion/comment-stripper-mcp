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

## MCP 서버 연결 문제 해결 가이드

MCP 서버가 Claude Desktop과 연결 시 예기치 않게 종료되는 문제가 발생할 수 있습니다. 이 문제를 해결하기 위한 가이드입니다.

### 문제 증상

- 서버가 초기화된 후 곧바로 종료됨
- 로그에 "Server transport closed unexpectedly" 메시지가 표시됨
- Claude Desktop에서 MCP 서버에 연결할 수 없다는 오류 메시지가 표시됨

### 해결 방법

#### 1. NVM을 사용한 깨끗한 Node.js 환경 설정

```bash
# NVM 설치 (이미 설치되어 있다면 생략)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 최신 Node.js 설치
nvm install node

# 설치한 버전 활성화
nvm use node
```

#### 2. Claude Desktop 설정 파일에 절대 경로 사용

Claude Desktop 설정 파일(`claude_desktop_config.json`)에서 상대 경로 대신 절대 경로를 사용하세요:

```json
{
  "mcpServers": {
    "comment-stripper": {
      "command": "/절대/경로/node",
      "args": [
        "/절대/경로/comment-stripper-mcp/build/index.js"
      ]
    }
  }
}
```

`which node` 명령어로 Node.js 경로를 확인할 수 있습니다.

#### 3. 서버 안정성 개선

서버 코드에 다음과 같은 안정성 개선 사항이 적용되어 있습니다:

- 프로세스가 예기치 않게 종료되지 않도록 `process.stdin.resume()` 사용
- 다중 keep-alive 메커니즘 구현
- 오류 처리 개선
- 상세한 로깅 추가

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

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

## API Documentation

### Strip Comments Endpoint

**Endpoint**: `/api/strip-comments`

**Method**: POST

**Description**: Strips comments from code files or text.

**Request Parameters**:

- `text` (optional): The text to strip comments from.
- `filePath` (optional): The path to a file to strip comments from.
- `directoryPath` (optional): The path to a directory to process.
- `recursive` (optional, default: true): Whether to recursively process subdirectories.
- `fileTypes` (optional, default: all supported): Array of file extensions to process.
- `trackProgress` (optional, default: false): Whether to track progress for directory processing.

**Response**:

```json
{
  "success": true,
  "data": {
    "original": "// Original code with comments",
    "stripped": "// Code with comments removed"
  }
}
```

### Get Progress Endpoint

**Endpoint**: `/api/get-progress`

**Method**: POST

**Description**: Gets the progress of a directory processing operation.

**Request Parameters**:

- `trackerId`: The ID of the progress tracker.

**Response**:

```json
{
  "success": true,
  "data": {
    "processed": 10,
    "total": 20,
    "percentage": 50,
    "completed": false
  }
}
```

### Authentication Status Endpoint

**Endpoint**: `/api/auth-status`

**Method**: POST

**Description**: Gets the current authentication status and configuration.

**Response**:

```json
{
  "success": true,
  "data": {
    "authEnabled": true,
    "authenticated": true,
    "message": "Authenticated successfully"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.