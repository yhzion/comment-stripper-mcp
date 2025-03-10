# Comment Stripper MCP API Documentation

This document provides comprehensive documentation for the Comment Stripper MCP API endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Strip Comments](#strip-comments)
  - [Get Progress](#get-progress)
  - [Auth Status](#auth-status)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Overview

The Comment Stripper MCP is a flexible server that processes code files to remove comments across multiple programming languages. It currently supports JavaScript, TypeScript, Vue, HTML, CSS, Python, and C-style languages with regex-based pattern matching.

## Authentication

The API supports optional authentication using an API token. When authentication is enabled, all API requests must include the token in the request headers.

**Authentication Header:**

```
Authorization: Bearer <your-api-token>
```

You can check the current authentication status using the `/api/auth-status` endpoint.

## API Endpoints

### Strip Comments

Removes comments from code based on the provided input type (text, file, or directory).

**Endpoint:** `/api/strip-comments`

**Method:** POST

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| text | string | No* | - | The code text to process |
| filePath | string | No* | - | Path to a single file to process |
| directoryPath | string | No* | - | Path to a directory to process |
| recursive | boolean | No | true | Whether to process subdirectories when processing a directory |
| fileTypes | string[] | No | All supported | Array of file extensions to process (e.g., ['js', 'ts']) |
| trackProgress | boolean | No | false | Whether to track and report progress for directory processing |

*At least one of `text`, `filePath`, or `directoryPath` must be provided.

**Response:**

For text input:

```json
{
  "success": true,
  "data": {
    "original": "// Original code with comments\nconst x = 10;",
    "stripped": "\nconst x = 10;"
  }
}
```

For file input:

```json
{
  "success": true,
  "data": {
    "original": "// Original file content\nconst x = 10;",
    "stripped": "\nconst x = 10;"
  }
}
```

For directory input:

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filePath": "/path/to/file1.js",
        "original": "// Original content\nconst x = 10;",
        "stripped": "\nconst x = 10;"
      },
      {
        "filePath": "/path/to/file2.ts",
        "original": "// Another file\nlet y = 20;",
        "stripped": "\nlet y = 20;"
      }
    ],
    "progress": {
      "trackerId": "dir_1615482367890",
      "processed": 2,
      "total": 2,
      "percentage": 100
    }
  }
}
```

### Get Progress

Retrieve the progress of a directory processing operation.

**Endpoint:** `/api/get-progress`

**Method:** POST

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| trackerId | string | Yes | The ID of the progress tracker to query |

**Response:**

```json
{
  "success": true,
  "data": {
    "processed": 15,
    "total": 30,
    "percentage": 50
  }
}
```

### Auth Status

Get the current authentication status and configuration.

**Endpoint:** `/api/auth-status`

**Method:** POST

**Request Parameters:** None

**Response:**

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "tokenRequired": true,
    "tokenHeader": "Authorization",
    "tokenPrefix": "Bearer"
  }
}
```

## Error Handling

When an error occurs, the API returns a standardized error response:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "details": "At least one of 'text', 'filePath', or 'directoryPath' must be provided"
  }
}
```

**Common Error Codes:**

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or validation error |
| 401 | Unauthorized - Authentication failed or required |
| 404 | Not Found - Resource not found (e.g., file or directory) |
| 500 | Server Error - Internal server error |

## Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error message",
    "details": "Detailed error information"
  }
}
```
