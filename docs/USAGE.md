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
  -d '{"text": "// This is a comment\nconst x = 10; // inline comment"}'
```

#### Using JavaScript fetch

```javascript
const response = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
  -d '{"filePath": "/path/to/file.js"}'
```

#### Using JavaScript fetch

```javascript
const response = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
  -d '{
    "directoryPath": "/path/to/directory",
    "recursive": true,
    "fileTypes": ["js", "ts"],
    "trackProgress": true
  }'
```

#### Using JavaScript fetch

```javascript
const response = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    directoryPath: '/path/to/directory',
    recursive: true,
    fileTypes: ['js', 'ts'],
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
  -d '{
    "directoryPath": "/path/to/large/directory",
    "recursive": true,
    "trackProgress": true
  }'

# Then, use the returned trackerId to check progress
curl -X POST http://localhost:3000/api/get-progress \
  -H "Content-Type: application/json" \
  -d '{"trackerId": "dir_1615482367890"}'
```

#### Using JavaScript fetch

```javascript
// Start processing with progress tracking
const processResponse = await fetch('http://localhost:3000/api/strip-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
      'Content-Type': 'application/json'
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

const API_URL = 'http://localhost:3000';

async function stripCommentsFromProject() {
  try {
    // Process a project directory
    const response = await fetch(`${API_URL}/api/strip-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        directoryPath: './src',
        recursive: true,
        fileTypes: ['js', 'ts', 'vue'],
        trackProgress: true
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('Error:', result.error.message);
      return;
    }
    
    // Save the stripped files to a new directory
    for (const file of result.data.files) {
      const outputPath = file.filePath.replace('./src', './dist');
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      // Write the stripped content
      await fs.writeFile(outputPath, file.stripped);
      console.log(`Processed: ${file.filePath} -> ${outputPath}`);
    }
    
    console.log(`Successfully processed ${result.data.files.length} files`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

stripCommentsFromProject();
```

### Python Integration

```python
# example.py
import requests
import json
import os
import time

API_URL = 'http://localhost:3000'

def strip_comments_from_project():
    try:
        # Process a project directory
        response = requests.post(
            f"{API_URL}/api/strip-comments",
            headers={'Content-Type': 'application/json'},
            json={
                'directoryPath': './src',
                'recursive': True,
                'fileTypes': ['js', 'ts', 'py'],
                'trackProgress': True
            }
        )
        
        result = response.json()
        
        if not result['success']:
            print(f"Error: {result['error']['message']}")
            return
        
        # Track progress if it's a large directory
        tracker_id = result['data']['progress']['trackerId']
        
        while True:
            progress_response = requests.post(
                f"{API_URL}/api/get-progress",
                headers={'Content-Type': 'application/json'},
                json={'trackerId': tracker_id}
            )
            
            progress = progress_response.json()['data']
            print(f"Progress: {progress['processed']}/{progress['total']} ({progress['percentage']}%)")
            
            if progress['percentage'] >= 100:
                break
                
            time.sleep(1)
        
        # Save the stripped files
        for file in result['data']['files']:
            output_path = file['filePath'].replace('./src', './dist')
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                f.write(file['stripped'])
                
            print(f"Processed: {file['filePath']} -> {output_path}")
            
        print(f"Successfully processed {len(result['data']['files'])} files")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    strip_comments_from_project()
```

### Shell Script Integration

```bash
#!/bin/bash
# process_project.sh

API_URL="http://localhost:3000"
PROJECT_DIR="./src"
OUTPUT_DIR="./dist"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Process the project directory
echo "Processing directory: $PROJECT_DIR"
response=$(curl -s -X POST "$API_URL/api/strip-comments" \
  -H "Content-Type: application/json" \
  -d "{
    \"directoryPath\": \"$PROJECT_DIR\",
    \"recursive\": true
  }")

# Check if the request was successful
success=$(echo "$response" | jq -r '.success')

if [ "$success" != "true" ]; then
  error_message=$(echo "$response" | jq -r '.error.message')
  echo "Error: $error_message"
  exit 1
 fi

# Extract and process each file
echo "$response" | jq -c '.data.files[]' | while read -r file; do
  file_path=$(echo "$file" | jq -r '.filePath')
  stripped_content=$(echo "$file" | jq -r '.stripped')
  
  # Create relative output path
  relative_path=${file_path#"$PROJECT_DIR/"}
  output_path="$OUTPUT_DIR/$relative_path"
  
  # Create directory structure
  mkdir -p "$(dirname "$output_path")"
  
  # Write stripped content to output file
  echo "$stripped_content" > "$output_path"
  
  echo "Processed: $file_path -> $output_path"
done

echo "Processing complete!"
```
