/**
 * Performance benchmarks for the comment-stripper-mcp
 * 
 * This file contains benchmarking utilities to measure the performance of
 * the comment stripping functionality across different file types and sizes.
 */

import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import {
  stripJsComments,
  stripVueComments,
  stripHtmlComments,
  stripCssComments,
  stripPythonComments,
  stripCStyleComments,
  stripCommentsByFileType
} from '../../src/utils/commentStripper.js';
import { processFile, processDirectory } from '../../src/utils/fileProcessor.js';

// Define benchmark sample sizes
const SAMPLE_SIZES = {
  SMALL: 10 * 1024,      // 10 KB
  MEDIUM: 100 * 1024,    // 100 KB
  LARGE: 1024 * 1024,    // 1 MB
  VERY_LARGE: 10 * 1024 * 1024  // 10 MB
};

// Sample code templates for different languages
const CODE_TEMPLATES = {
  js: {
    code: `
// This is a single line comment
const x = 10;

/* This is a 
   multi-line comment */
function test() {
  // Another comment
  return "This is a string with // comment-like content";
}

const regex = /\/\/ this is not a comment/;
`,
    commentRatio: 0.4  // Approximate ratio of comments to code
  },
  html: {
    code: `
<!DOCTYPE html>
<html>
  <!-- This is an HTML comment -->
  <head>
    <title>Test</title>
  </head>
  <body>
    <!-- Another comment -->
    <div>Hello World</div>
  </body>
</html>
`,
    commentRatio: 0.3
  },
  css: {
    code: `
/* Basic styling */
body {
  margin: 0;
  padding: 0;
  /* Font settings */
  font-family: Arial, sans-serif;
}

/* Header styles */
header {
  background-color: #333;
  color: white;
}
`,
    commentRatio: 0.35
  },
  py: {
    code: `
# This is a Python comment
import sys

def main():
    # Another comment
    print("Hello World")  # Inline comment
    
    # Multi-line string, not a comment
    s = """This is a
    multi-line string
    # Not a comment
    """
    
    return 0

if __name__ == "__main__":
    main()
`,
    commentRatio: 0.4
  }
};

/**
 * Generates a sample file of specified size and language
 * 
 * @param language - The programming language to generate code for
 * @param sizeBytes - The target file size in bytes
 * @returns The generated code string
 */
function generateSampleCode(language: keyof typeof CODE_TEMPLATES, sizeBytes: number): string {
  const template = CODE_TEMPLATES[language];
  const templateSize = template.code.length;
  
  // Calculate how many repetitions we need
  const repetitions = Math.ceil(sizeBytes / templateSize);
  
  // Generate the code by repeating the template
  let code = '';
  for (let i = 0; i < repetitions; i++) {
    code += template.code.replace(/\d+/g, () => String(Math.floor(Math.random() * 1000)));
  }
  
  // Trim to exact size
  return code.substring(0, sizeBytes);
}

/**
 * Runs a benchmark for a specific stripping function
 * 
 * @param name - Name of the benchmark
 * @param stripFn - The stripping function to benchmark
 * @param code - The code to process
 * @param iterations - Number of iterations to run
 * @returns Benchmark results
 */
async function runBenchmark(
  name: string,
  stripFn: (code: string) => string,
  code: string,
  iterations: number = 5
): Promise<{ name: string, avgTime: number, throughput: number, commentReduction: number }> {
  const times: number[] = [];
  let strippedCode = '';
  
  // Warm up
  stripFn(code);
  
  // Run the benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    strippedCode = stripFn(code);
    const end = performance.now();
    times.push(end - start);
  }
  
  // Calculate statistics
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const throughput = (code.length / 1024 / 1024) / (avgTime / 1000); // MB/s
  const commentReduction = 100 * (1 - strippedCode.length / code.length);
  
  return {
    name,
    avgTime,
    throughput,
    commentReduction
  };
}

/**
 * Runs all benchmarks for different languages and file sizes
 */
async function runAllBenchmarks() {
  console.log('\n🚀 Running Comment Stripper Performance Benchmarks\n');
  console.log('=============================================\n');
  
  // Define the benchmarks to run
  const benchmarks = [
    { name: 'JavaScript', fn: stripJsComments, lang: 'js' as const },
    { name: 'HTML', fn: stripHtmlComments, lang: 'html' as const },
    { name: 'CSS', fn: stripCssComments, lang: 'css' as const },
    { name: 'Python', fn: stripPythonComments, lang: 'py' as const }
  ];
  
  // Run benchmarks for different file sizes
  for (const size of Object.entries(SAMPLE_SIZES)) {
    const [sizeName, sizeBytes] = size;
    
    console.log(`\n📊 File Size: ${sizeName} (${sizeBytes / 1024} KB)\n`);
    console.log('Language | Avg Time (ms) | Throughput (MB/s) | Comment Reduction (%)');
    console.log('---------|--------------|------------------|--------------------');
    
    for (const benchmark of benchmarks) {
      const code = generateSampleCode(benchmark.lang, sizeBytes);
      const result = await runBenchmark(`${benchmark.name} (${sizeName})`, benchmark.fn, code);
      
      console.log(
        `${benchmark.name.padEnd(9)} | ` +
        `${result.avgTime.toFixed(2).padStart(12)} | ` +
        `${result.throughput.toFixed(2).padStart(16)} | ` +
        `${result.commentReduction.toFixed(2).padStart(19)}`
      );
    }
  }
  
  // Benchmark real-world file processing
  console.log('\n📊 Real-world File Processing\n');
  await benchmarkFileProcessing();
  
  // Benchmark directory processing
  console.log('\n📊 Directory Processing\n');
  await benchmarkDirectoryProcessing();
}

/**
 * Benchmarks file processing with real-world examples
 */
async function benchmarkFileProcessing() {
  try {
    // Create a temporary directory for benchmark files
    const benchmarkDir = path.join(process.cwd(), 'tests', 'benchmark', 'files');
    await fs.mkdir(benchmarkDir, { recursive: true });
    
    // Generate sample files
    const files = [
      { name: 'sample.js', lang: 'js' as const, size: SAMPLE_SIZES.MEDIUM },
      { name: 'sample.html', lang: 'html' as const, size: SAMPLE_SIZES.MEDIUM },
      { name: 'sample.css', lang: 'css' as const, size: SAMPLE_SIZES.MEDIUM },
      { name: 'sample.py', lang: 'py' as const, size: SAMPLE_SIZES.MEDIUM }
    ];
    
    for (const file of files) {
      const filePath = path.join(benchmarkDir, file.name);
      const code = generateSampleCode(file.lang, file.size);
      await fs.writeFile(filePath, code, 'utf-8');
    }
    
    console.log('File      | Avg Time (ms) | Throughput (MB/s) | Comment Reduction (%)');
    console.log('----------|--------------|------------------|--------------------');
    
    // Benchmark each file
    for (const file of files) {
      const filePath = path.join(benchmarkDir, file.name);
      
      // Warm up
      await processFile(filePath);
      
      // Benchmark
      const iterations = 5;
      const times: number[] = [];
      let result;
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        result = await processFile(filePath);
        const end = performance.now();
        times.push(end - start);
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const fileSize = (result?.original.length || 0) / 1024 / 1024; // MB
      const throughput = fileSize / (avgTime / 1000); // MB/s
      const commentReduction = result ? 100 * (1 - result.stripped.length / result.original.length) : 0;
      
      console.log(
        `${file.name.padEnd(10)} | ` +
        `${avgTime.toFixed(2).padStart(12)} | ` +
        `${throughput.toFixed(2).padStart(16)} | ` +
        `${commentReduction.toFixed(2).padStart(19)}`
      );
    }
    
    // Clean up
    await fs.rm(benchmarkDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error in file processing benchmark:', error);
  }
}

/**
 * Benchmarks directory processing
 */
async function benchmarkDirectoryProcessing() {
  try {
    // Create a temporary directory structure for benchmarking
    const benchmarkDir = path.join(process.cwd(), 'tests', 'benchmark', 'directory');
    await fs.mkdir(benchmarkDir, { recursive: true });
    
    // Create subdirectories
    const subdirs = ['src', 'lib', 'components', 'utils'];
    for (const dir of subdirs) {
      await fs.mkdir(path.join(benchmarkDir, dir), { recursive: true });
    }
    
    // Generate sample files in each directory
    const fileTypes = [
      { ext: 'js', lang: 'js' as const },
      { ext: 'html', lang: 'html' as const },
      { ext: 'css', lang: 'css' as const },
      { ext: 'py', lang: 'py' as const }
    ];
    
    // Create 5 files of each type in each directory
    for (const dir of ['', ...subdirs]) {
      const dirPath = path.join(benchmarkDir, dir);
      
      for (const type of fileTypes) {
        for (let i = 1; i <= 5; i++) {
          const filePath = path.join(dirPath, `sample${i}.${type.ext}`);
          const code = generateSampleCode(type.lang, SAMPLE_SIZES.SMALL);
          await fs.writeFile(filePath, code, 'utf-8');
        }
      }
    }
    
    console.log('Directory structure created with 100 files for benchmarking');
    
    // Benchmark directory processing
    console.log('\nRecursive | Files | Avg Time (ms) | Files/sec');
    console.log('----------|-------|--------------|----------');
    
    // Test with and without recursion
    for (const recursive of [false, true]) {
      // Warm up
      await processDirectory(benchmarkDir, recursive);
      
      // Benchmark
      const iterations = 3;
      const times: number[] = [];
      let fileCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const results = await processDirectory(benchmarkDir, recursive);
        const end = performance.now();
        times.push(end - start);
        fileCount = Object.keys(results).length;
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const filesPerSecond = fileCount / (avgTime / 1000);
      
      console.log(
        `${String(recursive).padEnd(10)} | ` +
        `${String(fileCount).padStart(5)} | ` +
        `${avgTime.toFixed(2).padStart(12)} | ` +
        `${filesPerSecond.toFixed(2).padStart(10)}`
      );
    }
    
    // Clean up
    await fs.rm(benchmarkDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error in directory processing benchmark:', error);
  }
}

// Run the benchmarks if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAllBenchmarks().catch(console.error);
}

// Export the benchmark functions for use in other files
export {
  runAllBenchmarks,
  runBenchmark,
  generateSampleCode,
  benchmarkFileProcessing,
  benchmarkDirectoryProcessing
};
