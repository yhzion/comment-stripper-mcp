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
- [Code Examples](#code-examples)

## Overview

The Comment Stripper MCP is a flexible server that processes code files to remove comments across multiple programming languages. It currently supports JavaScript, TypeScript, Vue, HTML, CSS, Python, and C-style languages with regex-based pattern matching.

Supported file extensions include:
- JavaScript: `.js`, `.jsx`, `.mjs`
- TypeScript: `.ts`, `.tsx`
- Vue: `.vue`
- HTML: `.html`, `.htm`
- CSS: `.css`, `.scss`, `.less`
- Python: `.py`
- C-style: `.java`, `.c`, `.cpp`, `.cs`
- Ruby: `.rb`
- PHP: `.php`

## Authentication

The API supports optional authentication using an API token. When authentication is enabled, all API requests must include the token in the request headers.

**Authentication Header:**

```
Authorization: Bearer <your-api-token>
```

You can check the current authentication status using the `/api/auth-status` endpoint.

To configure authentication, set the following environment variables:

```
AUTH_ENABLED=true
API_TOKEN=your-secret-token
TOKEN_HEADER=Authorization
TOKEN_PREFIX=Bearer
```

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

Retrieve the progress of a directory processing operation. This is particularly useful for tracking large directory processing tasks.

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

**Error Response (tracker not found):**

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Progress tracker not found",
    "details": "No tracker found with ID: dir_1615482367890"
  }
}
```

### Auth Status

Get the current authentication status and configuration. This endpoint can be used to verify if authentication is enabled and what authentication method is required.

**Endpoint:** `/api/auth-status`

**Method:** POST

**Request Parameters:** None

**Response:**

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

Possible message values:
- "Authenticated successfully" - Authentication is enabled and the request is authenticated
- "Not authenticated" - Authentication is enabled but the request is not authenticated
- "Authentication is disabled" - Authentication is not enabled for this server

## Error Handling

When an error occurs, the API returns a standardized error response:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation error",
    "details": "At least one of 'text', 'filePath', or 'directoryPath' must be provided"
  }
}
```

**Common Error Codes:**

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or request format |
| 401 | Unauthorized - Authentication required or failed |
| 404 | Not Found - Resource not found (e.g., file or directory) |
| 500 | Server Error - Internal server error |

**Specific Error Types:**

1. **Validation Errors** (400):
   - Missing required parameters
   - Invalid parameter types
   - Conflicting parameters

2. **Authentication Errors** (401):
   - Missing API token
   - Invalid API token
   - Expired API token

3. **File System Errors** (404/500):
   - File not found
   - Directory not found
   - Permission denied
   - I/O errors

4. **Progress Tracking Errors** (404):
   - Invalid tracker ID
   - Expired tracker ID

## Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": { /* Response data specific to the endpoint */ }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error summary",
    "details": "Detailed error information"
  }
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
// Using fetch API
async function stripCommentsFromText(text: string, apiToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (apiToken) {
    headers['Authorization'] = `Bearer ${apiToken}`;
  }
  
  const response = await fetch('http://localhost:3000/api/strip-comments', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Error: ${result.error.message} - ${result.error.details}`);
  }
  
  return result.data.stripped;
}

// Using axios
import axios from 'axios';

async function processDirectory(directoryPath: string, apiToken?: string) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    }
    
    const response = await axios.post('http://localhost:3000/api/strip-comments', {
      directoryPath,
      recursive: true,
      trackProgress: true
    }, { headers });
    
    const { trackerId } = response.data.data.progress;
    console.log(`Processing started. Tracker ID: ${trackerId}`);
    
    // Poll for progress
    const pollProgress = async () => {
      const progressResponse = await axios.post('http://localhost:3000/api/get-progress', {
        trackerId
      }, { headers });
      
      const { processed, total, percentage } = progressResponse.data.data;
      console.log(`Progress: ${processed}/${total} (${percentage}%)`);
      
      if (percentage < 100) {
        setTimeout(pollProgress, 1000);
      } else {
        console.log('Processing complete!');
      }
    };
    
    pollProgress();
    
    return response.data;
  } catch (error) {
    console.error('Error processing directory:', error);
    throw error;
  }
}
```

### Python

```python
import requests
import time
import json

def strip_comments_from_file(file_path, api_url='http://localhost:3000/api/strip-comments', api_token=None):
    headers = {'Content-Type': 'application/json'}
    
    if api_token:
        headers['Authorization'] = f'Bearer {api_token}'
    
    response = requests.post(
        api_url,
        headers=headers,
        json={'filePath': file_path}
    )
    
    result = response.json()
    
    if not result.get('success'):
        error = result.get('error', {})
        raise Exception(f"Error {error.get('code')}: {error.get('message')} - {error.get('details')}")
    
    return result['data']['stripped']

def process_directory_with_progress(directory_path, api_url='http://localhost:3000', api_token=None):
    headers = {'Content-Type': 'application/json'}
    
    if api_token:
        headers['Authorization'] = f'Bearer {api_token}'
    
    # Start processing
    response = requests.post(
        f'{api_url}/api/strip-comments',
        headers=headers,
        json={
            'directoryPath': directory_path,
            'recursive': True,
            'trackProgress': True
        }
    )
    
    result = response.json()
    
    if not result.get('success'):
        error = result.get('error', {})
        raise Exception(f"Error {error.get('code')}: {error.get('message')} - {error.get('details')}")
    
    tracker_id = result['data']['progress']['trackerId']
    print(f"Processing started. Tracker ID: {tracker_id}")
    
    # Poll for progress
    while True:
        progress_response = requests.post(
            f'{api_url}/api/get-progress',
            headers=headers,
            json={'trackerId': tracker_id}
        )
        
        progress_result = progress_response.json()
        
        if not progress_result.get('success'):
            error = progress_result.get('error', {})
            raise Exception(f"Error {error.get('code')}: {error.get('message')} - {error.get('details')}")
        
        progress_data = progress_result['data']
        print(f"Progress: {progress_data['processed']}/{progress_data['total']} ({progress_data['percentage']}%)")
        
        if progress_data['percentage'] >= 100:
            print("Processing complete!")
            break
        
        time.sleep(1)
    
    return result['data']
```

### cURL

```bash
# Strip comments from text
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"text": "// This is a comment\nconst x = 10; // inline comment"}'

# Process a file
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"filePath": "/path/to/file.js"}'

# Process a directory with progress tracking
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"directoryPath": "/path/to/directory", "recursive": true, "trackProgress": true}'

# Check progress
curl -X POST http://localhost:3000/api/get-progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"trackerId": "dir_1615482367890"}'

# Check authentication status
curl -X POST http://localhost:3000/api/auth-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
