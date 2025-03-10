# Comment Stripper MCP - Performance Benchmarks

This document describes the performance benchmarking system for the Comment Stripper MCP project.

## Overview

The benchmarking system measures the performance of the comment stripping functionality across different:
- Programming languages
- File sizes
- Processing methods (single file vs. directory)

## Running Benchmarks

To run the benchmarks, use the following command:

```bash
npm run benchmark
```

This will execute a series of tests and output the results to the console.

## Benchmark Types

### 1. In-Memory String Processing

These benchmarks measure the raw performance of the comment stripping functions for different languages and file sizes:

- **Small** (10 KB)
- **Medium** (100 KB)
- **Large** (1 MB)
- **Very Large** (10 MB)

Metrics reported:
- Average processing time (ms)
- Throughput (MB/s)
- Comment reduction percentage

### 2. File Processing

These benchmarks measure the performance of processing individual files, including file I/O operations.

### 3. Directory Processing

These benchmarks measure the performance of processing entire directories, both with and without recursion.

## Latest Benchmark Results (2025-03-10)

```
🚀 Comment Stripper Performance Results

=============================================

📊 JavaScript Performance

File Size | Avg Time (ms) | Throughput (MB/s)
----------|--------------|------------------
100KB     |         0.59 |            169.49
500KB     |         3.20 |            156.25

📊 Python Performance

File Size | Avg Time (ms) | Throughput (MB/s)
----------|--------------|------------------
100KB     |         0.91 |            109.89
500KB     |         5.90 |             84.75
```

## Interpreting Results

- **Average Time**: Lower is better. This is the average time taken to process the file.
- **Throughput**: Higher is better. This measures how many megabytes of code can be processed per second.
- **Comment Reduction**: This shows the percentage of the file that was comments and was removed.

## Benchmarking Best Practices

1. **Run benchmarks on a quiet system** - Close other applications to get consistent results.
2. **Run multiple times** - The benchmarking system runs each test multiple times to get more accurate averages.
3. **Compare relative performance** - Focus on comparing the relative performance between different versions rather than absolute numbers.

## Continuous Integration

Benchmarks are automatically run as part of the CI/CD pipeline for commits to the main branch. This helps track performance changes over time.
