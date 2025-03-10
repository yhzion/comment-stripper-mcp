# Comment Stripper MCP Usage Examples

This document provides practical examples of how to use the Comment Stripper MCP in various scenarios.

## Table of Contents

- [Command Line Usage](#command-line-usage)
- [API Usage](#api-usage)
  - [Processing Text](#processing-text)
  - [Processing a Single File](#processing-a-single-file)
  - [Processing a Directory](#processing-a-directory)
  - [Tracking Progress](#tracking-progress)
- [Integration Examples](#integration-examples)
  - [Node.js Integration](#nodejs-integration)
  - [Python Integration](#python-integration)
  - [Shell Script Integration](#shell-script-integration)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Command Line Usage

The Comment Stripper MCP can be used directly from the command line:

```bash
# Process a text string
echo "// This is a comment\nconst x = 10;" | comment-stripper-mcp

# Process a single file
comment-stripper-mcp --file path/to/file.js

# Process a directory
comment-stripper-mcp --dir path/to/directory --recursive

# Process specific file types in a directory
comment-stripper-mcp --dir path/to/directory --file-types js,ts

# Track progress for directory processing
comment-stripper-mcp --dir path/to/directory --track-progress
```

## API Usage

### Processing Text

#### Using curl

```bash
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"text": "// This is a comment\nconst x = 10; // inline comment"}'
```

#### Using JavaScript fetch

```javascript
const response = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    text: '// This is a comment\nconst x = 10; // inline comment'
  })
});

const result = await response.json();
console.log(result.data.stripped);
// Output: "\nconst x = 10; "
```

### Processing a Single File

#### Using curl

```bash
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"filePath": "/path/to/file.js"}'
```

#### Using JavaScript fetch

```javascript
const response = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    filePath: '/path/to/file.js'
  })
});

const result = await response.json();
console.log(result.data.stripped);
```

### Processing a Directory

#### Using curl

```bash
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "directoryPath": "/path/to/directory",
    "recursive": true,
    "fileTypes": ["js", "ts", "vue", "html", "css", "py", "java", "cpp", "cs", "rb", "php"],
    "trackProgress": true
  }'
```

#### Using JavaScript fetch

```javascript
const response = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    directoryPath: '/path/to/directory',
    recursive: true,
    fileTypes: ['js', 'ts', 'vue', 'html', 'css', 'py', 'java', 'cpp', 'cs', 'rb', 'php'],
    trackProgress: true
  })
});

const result = await response.json();
console.log(`Processed ${result.data.files.length} files`);
console.log(`Progress tracker ID: ${result.data.progress.trackerId}`);
```

### Tracking Progress

#### Using curl

```bash
# First, start a directory processing operation with trackProgress: true
curl -X POST http://localhost:3000/api/strip-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "directoryPath": "/path/to/large/directory",
    "recursive": true,
    "trackProgress": true
  }'

# Then, use the returned trackerId to check progress
curl -X POST http://localhost:3000/api/get-progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"trackerId": "dir_1615482367890"}'
```

#### Using JavaScript fetch

```javascript
// Start processing with progress tracking
const processResponse = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    directoryPath: '/path/to/large/directory',
    recursive: true,
    trackProgress: true
  })
});

const processResult = await processResponse.json();
const trackerId = processResult.data.progress.trackerId;

// Check progress periodically
const checkProgress = async () => {
  const progressResponse = await fetch('http://localhost:3000/api/get-progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({ trackerId })
  });
  
  const progressResult = await progressResponse.json();
  console.log(`Progress: ${progressResult.data.processed}/${progressResult.data.total} (${progressResult.data.percentage}%)`);
  
  if (progressResult.data.percentage < 100) {
    // Check again in 1 second
    setTimeout(checkProgress, 1000);
  } else {
    console.log('Processing complete!');
  }
};

checkProgress();
```

## Integration Examples

### Node.js Integration

```javascript
// example.js
import fetch from 'node-fetch';

async function stripCommentsFromDirectory() {
  try {
    const response = await fetch('http://localhost:3000/api/strip-comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        directoryPath: './src',
        recursive: true,
        fileTypes: ['js', 'ts'],
        trackProgress: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Successfully processed ${result.data.files.length} files`);
      console.log(`Total comments removed: ${result.data.stats.totalCommentsRemoved}`);
      console.log(`Total bytes saved: ${result.data.stats.totalBytesSaved}`);
    } else {
      console.error(`Error: ${result.error.message}`);
    }
  } catch (error) {
    console.error('Failed to process directory:', error);
  }
}

stripCommentsFromDirectory();
```

### Python Integration

```python
# example.py
import requests
import json
import time

def strip_comments_from_directory():
    api_url = "http://localhost:3000/api/strip-comments"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY"
    }
    payload = {
        "directoryPath": "./src",
        "recursive": True,
        "fileTypes": ["js", "ts", "py"],
        "trackProgress": True
    }
    
    try:
        response = requests.post(api_url, headers=headers, data=json.dumps(payload))
        result = response.json()
        
        if result["success"]:
            tracker_id = result["data"]["progress"]["trackerId"]
            print(f"Processing started. Tracker ID: {tracker_id}")
            
            # Poll for progress
            check_progress(tracker_id)
        else:
            print(f"Error: {result['error']['message']}")
    except Exception as e:
        print(f"Failed to process directory: {str(e)}")

def check_progress(tracker_id):
    api_url = "http://localhost:3000/api/get-progress"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY"
    }
    payload = {"trackerId": tracker_id}
    
    while True:
        try:
            response = requests.post(api_url, headers=headers, data=json.dumps(payload))
            result = response.json()
            
            if result["success"]:
                progress = result["data"]
                print(f"Progress: {progress['processed']}/{progress['total']} ({progress['percentage']}%)")
                
                if progress["percentage"] >= 100:
                    print("Processing complete!")
                    break
            else:
                print(f"Error checking progress: {result['error']['message']}")
                break
                
            time.sleep(1)  # Wait 1 second before checking again
        except Exception as e:
            print(f"Failed to check progress: {str(e)}")
            break

if __name__ == "__main__":
    strip_comments_from_directory()
```

### Shell Script Integration

```bash
#!/bin/bash

# example.sh
API_URL="http://localhost:3000/api/strip-comments"
API_KEY="YOUR_API_KEY"
DIRECTORY="./src"

# Process a directory
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"directoryPath\": \"$DIRECTORY\",
    \"recursive\": true,
    \"fileTypes\": [\"js\", \"ts\"]
  }")

# Check if the request was successful
success=$(echo $response | jq -r '.success')

if [ "$success" = "true" ]; then
  # Extract statistics
  processed_files=$(echo $response | jq -r '.data.files | length')
  total_bytes_saved=$(echo $response | jq -r '.data.stats.totalBytesSaved')
  
  echo "Successfully processed $processed_files files"
  echo "Total bytes saved: $total_bytes_saved"
else
  # Extract error message
  error_message=$(echo $response | jq -r '.error.message')
  echo "Error: $error_message"
  exit 1
fi
```

## Authentication

The Comment Stripper MCP API requires authentication for all endpoints. You need to include an API key in the `Authorization` header of your requests.

```
Authorization: Bearer YOUR_API_KEY
```

You can configure API keys in the server's environment variables or configuration file.

## Error Handling

The API returns standardized error responses with HTTP status codes and detailed error messages. Here are some common error scenarios and how to handle them:

### Common Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid input: directoryPath must be a string",
    "details": {
      "field": "directoryPath",
      "expected": "string",
      "received": "number"
    }
  }
}
```

### Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| INVALID_INPUT | 400 | The request contains invalid input parameters |
| FILE_NOT_FOUND | 404 | The specified file or directory was not found |
| UNAUTHORIZED | 401 | Missing or invalid API key |
| INTERNAL_ERROR | 500 | An unexpected error occurred on the server |
| UNSUPPORTED_FILE_TYPE | 400 | The file type is not supported for comment stripping |

### Handling Errors in JavaScript

```javascript
try {
  const response = await fetch('http://localhost:3000/api/strip-comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      filePath: '/path/to/file.js'
    })
  });

  const result = await response.json();
  
  if (!result.success) {
    // Handle specific error types
    switch (result.error.code) {
      case 'FILE_NOT_FOUND':
        console.error('The specified file was not found');
        break;
      case 'UNAUTHORIZED':
        console.error('Invalid API key');
        break;
      default:
        console.error(`Error: ${result.error.message}`);
    }
  } else {
    console.log('Success:', result.data);
  }
} catch (error) {
  console.error('Network or parsing error:', error);
}
